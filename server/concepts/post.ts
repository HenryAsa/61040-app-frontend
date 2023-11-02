import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";


export interface PostDoc extends BaseDoc {
  author: ObjectId;
  content: string;
  scope: ObjectId;
}

export default class PostConcept {
  public readonly posts = new DocCollection<PostDoc>("posts");

  async create(author: ObjectId, content: string, scope?: ObjectId) {
    const _id = await this.posts.createOne({ author: author, content: content, scope: scope });
    return { msg: "Post successfully created!", post: await this.posts.readOne({ _id }) };
  }

  async getPosts(query: Filter<PostDoc>) {
    const posts = await this.posts.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return posts;
  }

  async getPostById(_id: ObjectId) {
    const post = await this.posts.readOne({ _id: _id });
    if (post === null) {
      throw new NotFoundError(`Post with the id '${_id}' was not found!`);
    }
    return post;
    // return this.sanitizePost(post);
  }

  async getPostsByScope(scope: ObjectId) {
    const posts = await this.posts.readMany({ scope: scope });
    if (posts === null) {
      throw new NotFoundError(`There are no posts in this scope.`);
    }
    return posts;
  }

  async getPostsByAuthor(author: ObjectId) {
    return await this.getPosts({ author: author });
  }

  async update(_id: ObjectId, update: Partial<PostDoc>) {
    this.sanitizeUpdate(update);
    await this.posts.updateOne({ _id }, update);
    return { msg: "Post successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.posts.deleteOne({ _id });
    return { msg: "Post deleted successfully!" };
  }

  async isAuthor(user: ObjectId, _id: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post ${_id} does not exist!`);
    }
    if (post.author.toString() !== user.toString()) {
      throw new PostAuthorNotMatchError(user, _id);
    }
  }

  private sanitizeUpdate(update: Partial<PostDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["content", "options"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}

export class PostAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}
