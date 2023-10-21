import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface CarpoolOptions {
  location?: ObjectId;
}

export interface CarpoolDoc extends BaseDoc {
  name: string;
  target: ObjectId;
  members: Array<ObjectId>;
  drivers: Array<ObjectId>;
  options: CarpoolOptions;
}

export default class CarpoolConcept {
  public readonly carpools = new DocCollection<CarpoolDoc>("carpools");

  async create(driver: ObjectId, name: string, target: ObjectId, options?: CarpoolOptions) {
    await this.canCreate(name);
    const _id = await this.carpools.createOne({ drivers: [driver], name: name, target: target, options: options });
    return { msg: `Carpool '${name}' was successfully created!`, carpool: await this.carpools.readOne({ _id }) };
  }

  async getCarpools(query: Filter<CarpoolDoc>) {
    const carpools = await this.carpools.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return carpools;
  }

  async getCarpoolByName(name: string) {
    const carpool = await this.carpools.readOne({ name: name });
    if (carpool === null) {
      throw new NotFoundError(`Carpool with the name '${name}' was not found!`);
    }
    return carpool;
    // return this.sanitizeCarpool(carpool);
  }

  async getCarpoolById(_id: ObjectId) {
    const carpool = await this.carpools.readOne({ _id: _id });
    if (carpool === null) {
      throw new NotFoundError(`Carpool with the id '${_id}' was not found!`);
    }
    return carpool;
  }

  async getCarpoolsInTargetId(target: ObjectId) {
    return await this.getCarpools({ target: target });
  }

  async getCarpoolsByDriver(driver: ObjectId) {
    return await this.getCarpools({ driver: driver });
  }

  async update(_id: ObjectId, update: Partial<CarpoolDoc>) {
    this.sanitizeUpdate(update);
    await this.carpools.updateOne({ _id }, update);
    return { msg: "Carpool successfully updated!" };
  }

  async addUserToCarpool(_id: ObjectId, user: ObjectId) {
    const carpool = await this.getCarpoolById(_id);
    if (carpool.members.some((id) => id.toString() === user.toString())) {
      throw new NotAllowedError("User is already a member of this carpool");
    }
    await this.update(_id, { members: carpool.members.concat(user) });
    return carpool.members;
  }

  async delete(_id: ObjectId, user: ObjectId) {
    try {
      await this.isDriver(_id, user);
    } catch (error) {
      await this.isMember(_id, user);
    }
    await this.carpools.deleteOne({ _id });
    return { msg: "Carpool deleted successfully!" };
  }

  async isDriver(_id: ObjectId, user: ObjectId, throw_error: boolean = true) {
    // if (carpool instanceof ObjectId) {
    //   carpool = await this.getCarpoolById(carpool);
    // }
    const carpool = await this.getCarpoolById(_id);
    const is_driver = carpool.drivers.some((id) => id.toString() === user.toString());
    if (!throw_error) return is_driver;
    if (!is_driver) throw new NotAllowedError("This user is already a driver");
  }

  async isNotDriver(_id: ObjectId, user: ObjectId, throw_error: boolean = true) {
    const is_not_driver = !this.isDriver(_id, user, false);
    if (!throw_error) return is_not_driver;
    if (!is_not_driver) throw new NotAllowedError("This user is not a drive");
  }

  async isMember(_id: ObjectId, user: ObjectId, throw_error: boolean = true) {
    const carpool = await this.getCarpoolById(_id);
    const is_member = carpool.members.some((id) => id.toString() === user.toString());
    if (!throw_error) return is_member;
    if (!is_member) throw new CarpoolMemberNotMatchError(user, _id);
  }

  async isNotMember(_id: ObjectId, user: ObjectId, throw_error: boolean = true) {
    const is_not_member = !this.isMember(_id, user, false);
    if (!throw_error) return is_not_member;
    if (!is_not_member) throw new NotAllowedError("This user is already a member");
  }

  private sanitizeUpdate(update: Partial<CarpoolDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["content", "options"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }

  private async canCreate(name: string) {
    if (!name) {
      throw new BadValuesError("The Carpool must be named something (it must be non-empty)!");
    }
    await this.isNameUnique(name);
  }

  private async isNameUnique(name: string) {
    if (await this.carpools.readOne({ name })) {
      throw new NotAllowedError(`Carpool with the name '${name}' already exists!`);
    }
  }
}

export class CarpoolDriverNotMatchError extends NotAllowedError {
  constructor(
    public readonly driver: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the driver of carpool {1}!", driver, _id);
  }
}

export class CarpoolMemberNotMatchError extends NotAllowedError {
  constructor(
    public readonly member: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the member of carpool {1}!", member, _id);
  }
}
