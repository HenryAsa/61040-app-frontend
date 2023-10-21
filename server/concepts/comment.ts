import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface CommentOptions {
  backgroundColor?: string;
  // comments?: Array<ObjectId>;  // I can just query database by parent comment id?
}

export interface CommentDoc extends BaseDoc {
  author: ObjectId;
  content: string;
  root: ObjectId;
  target: ObjectId;
  options?: CommentOptions;
}

export default class CommentConcept {
  public readonly comments = new DocCollection<CommentDoc>("comments");

  async create(author: ObjectId, content: string, target: ObjectId, root: ObjectId, options?: CommentOptions) {
    const _id = await this.comments.createOne({ author, content, target, root, options });
    return { msg: "Comment successfully created!", comment: await this.comments.readOne({ _id }) };
  }

  async getComments(query: Filter<CommentDoc>) {
    const comments = await this.comments.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return comments;
  }

  async getCommentsByUserId(user: ObjectId) {
    return await this.getComments({ user });
  }

  async getCommentsByTarget(target: ObjectId) {
    return await this.getComments({ target });
  }

  async getCommentsByRoot(root: ObjectId) {
    return await this.getComments({ root });
  }

  async getCommentsByAuthor(author: ObjectId) {
    return await this.getComments({ author });
  }

  async update(_id: ObjectId, update: Partial<CommentDoc>) {
    this.sanitizeUpdate(update);
    await this.comments.updateOne({ _id }, update);
    return { msg: "Comment successfully updated!" };
  }

  async delete(comment: ObjectId) {
    const [children, _] = await Promise.all([
      this.getCommentsByTarget(comment), // Get all Children
      this.comments.deleteOne({ _id: comment }), // and delete current comment
    ]);
    // Now delete all children by recursively calling this function
    await Promise.all(children.map((child) => this.delete(child._id)));
  }

  async deleteByRoot(_id: ObjectId) {
    await this.comments.deleteMany({ root: _id });
  }

  async isAuthor(user: ObjectId, _id: ObjectId) {
    const comment = await this.comments.readOne({ _id });
    if (!comment) {
      throw new NotFoundError(`Comment '${_id}' does not exist!`);
    }
    if (comment.author.toString() !== user.toString()) {
      throw new CommentAuthorNotMatchError(user, _id);
    }
  }

  private sanitizeUpdate(update: Partial<CommentDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["content", "options"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}

export class CommentAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of comment {1}!", author, _id);
  }
}
