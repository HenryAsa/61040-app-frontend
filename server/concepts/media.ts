import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface MediaDoc extends BaseDoc {
  creator: ObjectId;
  media_url: String;
  target?: ObjectId;
}

export default class MediaConcept {
  public readonly media = new DocCollection<MediaDoc>("media");

  async create(creator: ObjectId, media_url: string, target?: ObjectId) {
    const _id = await this.media.createOne({ creator: creator, media_url: media_url, target: target });
    return { msg: `Media was successfully created!`, media: await this.media.readOne({ _id }) };
  }

  async getMedia(query: Filter<MediaDoc>) {
    const media = await this.media.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return media;
  }

  async getMediaByCreator(user: ObjectId) {
    const media = await this.media.readMany({ creator: user });
    if (media.length === 0) {
      throw new NotFoundError(`This user has not uploaded any media`);
    }
    return media;
  }

  async getMediaByTarget(target: ObjectId) {
    const media = await this.media.readMany({ target: target });
    if (media.length === 0) {
      throw new NotFoundError(`This target does not have any associated media`);
    }
    return media;
  }

  async getMediaById(_id: ObjectId) {
    const media = await this.media.readOne({ _id: _id });
    if (media === null) {
      throw new NotFoundError(`Media with the id '${_id}' was not found!`);
    }
    return media;
  }

  async update(_id: ObjectId, update: Partial<MediaDoc>) {
    await this.media.updateOne({ _id }, update);
    return { msg: "Media successfully updated!" };
  }

  async delete(_id: ObjectId, user: ObjectId) {
    await this.isCreator(_id, user);
    await this.media.deleteOne({ _id });
    return { msg: "Media deleted successfully!" };
  }

  async isCreator(_id: ObjectId, user: ObjectId, throw_error: boolean = true) {
    const media = await this.getMediaById(_id);
    const is_creator = media.creator.toString() !== user.toString();
    if (!throw_error) return is_creator;
    if (!is_creator) throw new MediaCreatorNotMatchError(user, _id);
  }

  async isNotCreator(_id: ObjectId, user: ObjectId, throw_error: boolean = true) {
    const is_not_creator = !this.isCreator(_id, user, false);
    if (!throw_error) return is_not_creator;
    if (!is_not_creator) throw new NotAllowedError("This user is the creator of the media");
  }
}

export class MediaCreatorNotMatchError extends NotAllowedError {
  constructor(
    public readonly creator: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the creator of media {1}!", creator, _id);
  }
}
