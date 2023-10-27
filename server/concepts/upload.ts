import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface UploadDoc extends BaseDoc {
  creator: ObjectId;
  upload_url: String;
  target?: ObjectId;
}

export default class UploadConcept {
  public readonly uploads = new DocCollection<UploadDoc>("uploads");

  async create(creator: ObjectId, upload_url: string, target?: ObjectId) {
    const _id = await this.uploads.createOne({ creator: creator, upload_url: upload_url, target: target });
    return { msg: `Upload was successfully created!`, upload: await this.uploads.readOne({ _id }) };
  }

  async getUploads(query: Filter<UploadDoc>) {
    const uploads = await this.uploads.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return uploads;
  }

  async getUploadsByCreator(user: ObjectId) {
    const uploads = await this.uploads.readMany({ creator: user });
    if (uploads.length === 0) {
      throw new NotFoundError(`This user has not uploaded any uploads`);
    }
    return uploads;
  }

  async getUploadsByTarget(target: ObjectId) {
    const uploads = await this.uploads.readMany({ target: target });
    if (uploads.length === 0) {
      throw new NotFoundError(`This target does not have any associated uploads`);
    }
    return uploads;
  }

  async getUploadById(_id: ObjectId) {
    const upload = await this.uploads.readOne({ _id: _id });
    if (upload === null) {
      throw new NotFoundError(`Upload with the id '${_id}' was not found!`);
    }
    return upload;
  }

  async update(_id: ObjectId, update: Partial<UploadDoc>) {
    await this.uploads.updateOne({ _id }, update);
    return { msg: "Upload successfully updated!" };
  }

  async delete(_id: ObjectId, user: ObjectId) {
    await this.isCreator(_id, user);
    await this.uploads.deleteOne({ _id });
    return { msg: "Upload deleted successfully!" };
  }

  async isCreator(_id: ObjectId, user: ObjectId, throw_error: boolean = true) {
    const upload = await this.getUploadById(_id);
    const is_creator = upload.creator.toString() !== user.toString();
    if (!throw_error) return is_creator;
    if (!is_creator) throw new UploadCreatorNotMatchError(user, _id);
  }

  async isNotCreator(_id: ObjectId, user: ObjectId, throw_error: boolean = true) {
    const is_not_creator = !this.isCreator(_id, user, false);
    if (!throw_error) return is_not_creator;
    if (!is_not_creator) throw new NotAllowedError("This user is the creator of the upload");
  }
}

export class UploadCreatorNotMatchError extends NotAllowedError {
  constructor(
    public readonly creator: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the creator of upload {1}!", creator, _id);
  }
}
