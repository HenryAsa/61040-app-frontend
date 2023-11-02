import { User } from "./app";
import { ActivityDoc, SanitizedActivityDoc } from "./concepts/activities";
import { AlreadyFriendsError, FriendNotFoundError, FriendRequestAlreadyExistsError, FriendRequestDoc, FriendRequestNotFoundError } from "./concepts/friend";
import { PostAuthorNotMatchError, PostDoc } from "./concepts/post";
import { Router } from "./framework/router";

/**
 * This class does useful conversions for the frontend.
 * For example, it converts a {@link PostDoc} into a more readable format for the frontend.
 */
export default class Responses {
  /**
   * Convert PostDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async post(post: PostDoc | null) {
    if (!post) {
      return post;
    }
    // const users = await User.idsToUsernames(activity.members);
    const post_author = await User.getUserById(post.author);
    return { ...post, author: post_author };
  }

  /**
   * Same as {@link post} but for an array of PostDoc for improved performance.
   */
  static async posts(posts: PostDoc | PostDoc[] | null) {
    if (!posts) {
      return posts;
    } else if (!("length" in posts)) {
      return await [this.post(posts)];
    }
    return await Promise.all(posts.map((post) => this.post(post)));
  }

  /**
   * Convert FriendRequestDoc into more readable format for the frontend
   * by converting the ids into usernames.
   */
  static async friendRequests(requests: FriendRequestDoc[]) {
    const from = requests.map((request) => request.from);
    const to = requests.map((request) => request.to);
    const usernames = await User.idsToUsernames(from.concat(to));
    return requests.map((request, i) => ({ ...request, from: usernames[i], to: usernames[i + requests.length] }));
  }

  /**
   * Convert ActivityDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async activity(activity: SanitizedActivityDoc | null) {
    if (!activity) {
      return activity;
    }
    // const users = await User.idsToUsernames(activity.members);
    const activity_members = await Promise.all(activity.members.map((member) => User.getUserById(member)));
    const activity_managers = await Promise.all(activity.managers.map((manager) => User.getUserById(manager)));
    return { ...activity, members: activity_members, managers: activity_managers };
  }

  /**
   * Same as {@link activity} but for an array of ActivityDoc for improved performance.
   */
  static async activities(activities: SanitizedActivityDoc | SanitizedActivityDoc[] | null) {
    if (!activities) {
      return activities;
    } else if (!("length" in activities)) {
      return await [this.activity(activities)];
    }
    return await Promise.all(activities.map((activity) => this.activity(activity)));
  }
}

Router.registerError(PostAuthorNotMatchError, async (e) => {
  const username = (await User.getUserById(e.author)).username;
  return e.formatWith(username, e._id);
});

Router.registerError(FriendRequestAlreadyExistsError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.from), User.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.user1), User.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendRequestNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.from), User.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(AlreadyFriendsError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.user1), User.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});
