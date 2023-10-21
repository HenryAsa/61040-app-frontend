import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface ActivityOptions {
  location?: ObjectId;
}

export interface ActivityDoc extends BaseDoc {
  name: string;
  location: ObjectId;
  members: Array<ObjectId>;
  creator: ObjectId;
  managers: Array<ObjectId>;
  carpools: Array<ObjectId>;
  join_code: String;
  options: ActivityOptions;
}

export default class ActivityConcept {
  public readonly activities = new DocCollection<ActivityDoc>("activities");

  async create(creator: ObjectId, name: string, join_code: string, options?: ActivityOptions) {
    await this.canCreate(name);
    const _id = await this.activities.createOne({ creator: creator, name: name, join_code: join_code, managers: [creator], members: [creator], carpools: [], options });
    return { msg: `Activity '${name}' was successfully created!`, activity: await this.activities.readOne({ _id }) };
  }

  private sanitizeActivity(activity: ActivityDoc) {
    // eslint-disable-next-line
    const { join_code, ...rest } = activity; // remove password
    return rest;
  }

  private sanitizeActivities(activities: Array<ActivityDoc>) {
    // eslint-disable-next-line
    return activities.map((activity) => this.sanitizeActivity(activity));
  }

  async verifyJoinCode(_id: ObjectId, join_code: string) {
    const activity = await this.activities.readOne({ _id, join_code });
    if (!activity) {
      throw new InvalidJoinCodeError(_id);
    }
    return { msg: "Successfully authenticated.", activity: activity };
  }

  async getActivities(query: Filter<ActivityDoc>) {
    const activities = await this.activities.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return this.sanitizeActivities(activities);
  }

  async getActivitiesByMemberId(user: ObjectId) {
    const activities = await this.activities.readMany({ members: { $elemMatch: { user } } });
    if (activities.length === 0) {
      throw new NotFoundError(`This user is not a member of any activities`);
    }
    return this.sanitizeActivities(activities);
  }

  async getActivityByName(name: string) {
    const activity = await this.activities.readOne({ name: name });
    if (activity === null) {
      throw new NotFoundError(`Activity with the name '${name}' was not found!`);
    }
    return this.sanitizeActivity(activity);
    // return this.sanitizeActivity(activity);
  }

  async getActivityById(_id: ObjectId) {
    const activity = await this.activities.readOne({ _id: _id });
    if (activity === null) {
      throw new NotFoundError(`Activity with the id '${_id}' was not found!`);
    }
    // return activity;
    return this.sanitizeActivity(activity);
  }

  async getActivitiesByCreator(creator: ObjectId) {
    return await this.getActivities({ creator });
  }

  async update(_id: ObjectId, update: Partial<ActivityDoc>) {
    await this.activities.updateOne({ _id }, update);
    return { msg: "Activity successfully updated!" };
  }

  async addUserToActivity(_id: ObjectId, user: ObjectId, join_code: string) {
    const activity = (await this.verifyJoinCode(_id, join_code)).activity;
    if (activity.members.some((id) => id.toString() === user.toString())) {
      throw new AlreadyMemberError(user, _id);
    }
    await this.update(_id, { members: activity.members.concat(user) });
    return activity.members;
  }

  async promoteMemberToManager(_id: ObjectId, user: ObjectId, user_to_promote: ObjectId) {
    const activity = await this.getActivityById(_id);
    await this.isManager(_id, user);
    await this.isMember(_id, user_to_promote);
    await this.isNotManager(_id, user_to_promote); // Rather than throwing an error, might just do a soft error that does nothing
    return await this.update(_id, { managers: activity.managers.concat(user_to_promote) });
  }

  async demoteManagerToMember(_id: ObjectId, user: ObjectId, user_to_demote: ObjectId) {
    await this.isManager(_id, user);
    const activity = await this.getActivityById(_id);
    const managers = activity.managers.filter((users) => users.toString() !== user_to_demote.toString());
    await this.update(_id, { managers: managers });
    return { msg: `'${user_to_demote}' is no longer a manager of '${_id}'` };
  }

  async removeMemberFromActivity(_id: ObjectId, user_to_remove: ObjectId) {
    await this.isManager(_id, user_to_remove); // Raises an error if the member is also a manager
    const activity = await this.getActivityById(_id);
    const members = activity.members.filter((users) => users.toString() !== user_to_remove.toString());
    await this.update(_id, { members: members });
    return { msg: `Successfully removed the member '${user_to_remove}' from the activity '${_id}'` };
  }

  async removeManagerFromActivity(_id: ObjectId, user_to_remove: ObjectId) {
    const activity = await this.getActivityById(_id);
    const managers = activity.managers.filter((users) => users.toString() !== user_to_remove.toString());
    if (managers.length === 0) {
      throw new BadValuesError("Removing this manager from the activity would leave the activity with no managers.  Promote a different member of the activity first before removing this manager");
    }
    await this.update(_id, { managers: managers });
    await this.removeMemberFromActivity(_id, user_to_remove);
    return { msg: `Successfully removed the manager '${user_to_remove}' from the activity '${_id}'` };
  }

  async kickUserFromActivity(_id: ObjectId, user: ObjectId, user_to_remove: ObjectId) {
    await this.isManager(_id, user);
    await this.removeManagerFromActivity(_id, user_to_remove);
    return { msg: `'${user_to_remove}' has been removed from the activity '${_id}'` };
  }

  async delete(_id: ObjectId, user: ObjectId) {
    await this.isManager(_id, user);
    await this.activities.deleteOne({ _id });
    return { msg: "Activity deleted successfully!" };
  }

  async isCreator(_id: ObjectId, user: ObjectId, throw_error: boolean = true) {
    const activity = await this.getActivityById(_id);
    const is_creator = activity.creator.toString() !== user.toString();
    if (!throw_error) return is_creator;
    if (!is_creator) throw new ActivityCreatorNotMatchError(user, _id);
  }

  async isNotCreator(_id: ObjectId, user: ObjectId, throw_error: boolean = true) {
    const is_not_creator = !this.isManager(_id, user, false);
    if (!throw_error) return is_not_creator;
    if (!is_not_creator) throw new NotAllowedError("This user is already a creator");
  }

  async isManager(_id: ObjectId, user: ObjectId, throw_error: boolean = true) {
    // if (activity instanceof ObjectId) {
    //   activity = await this.getActivityById(activity);
    // }
    const activity = await this.getActivityById(_id);
    const is_manager = activity.managers.some((id) => id.toString() === user.toString());
    if (!throw_error) return is_manager;
    if (!is_manager) throw new ActivityManagerNotMatchError(user, _id);
  }

  async isNotManager(_id: ObjectId, user: ObjectId, throw_error: boolean = true) {
    const is_not_manager = !this.isManager(_id, user, false);
    if (!throw_error) return is_not_manager;
    if (!is_not_manager) throw new NotAllowedError("This user is already a manager");
  }

  async isMember(_id: ObjectId, user: ObjectId, throw_error: boolean = true) {
    const activity = await this.getActivityById(_id);
    const is_member = activity.members.some((id) => id.toString() === user.toString());
    if (!throw_error) return is_member;
    if (!is_member) throw new ActivityMemberNotMatchError(user, _id);
  }

  async isNotMember(_id: ObjectId, user: ObjectId, throw_error: boolean = true) {
    const is_not_member = !this.isMember(_id, user, false);
    if (!throw_error) return is_not_member;
    if (!is_not_member) throw new NotAllowedError("This user is already a member");
  }

  // private sanitizeUpdate(update: Partial<ActivityDoc>) {
  //   // Make sure the update cannot change the author.
  //   const allowedUpdates = ["members", "managers", "location", "car"];
  //   for (const key in update) {
  //     if (!allowedUpdates.includes(key)) {
  //       throw new NotAllowedError(`Cannot update '${key}' field!`);
  //     }
  //   }
  // }

  private async canCreate(name: string) {
    if (!name) {
      throw new BadValuesError("The Activity must be named something (it must be non-empty)!");
    }
    await this.isNameUnique(name);
  }

  private async isNameUnique(name: string) {
    if (await this.activities.readOne({ name })) {
      throw new NotAllowedError(`Activity with the name '${name}' already exists!`);
    }
  }
}

export class ActivityCreatorNotMatchError extends NotAllowedError {
  constructor(
    public readonly creator: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the creator of activity {1}!", creator, _id);
  }
}

export class ActivityManagerNotMatchError extends NotAllowedError {
  constructor(
    public readonly manager: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the manager of activity {1}!", manager, _id);
  }
}

export class ActivityMemberNotMatchError extends NotAllowedError {
  constructor(
    public readonly member: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the member of activity {1}!", member, _id);
  }
}

export class AlreadyMemberError extends NotAllowedError {
  constructor(
    public readonly user: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is already in the activity {1}!", user, _id);
  }
}

export class InvalidJoinCodeError extends BadValuesError {
  constructor(public readonly join_code: ObjectId) {
    super("The Join Code to join {0} is incorrect!", join_code);
  }
}
