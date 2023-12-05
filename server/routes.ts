import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Activity, Carpool, Comment, Friend, Location, Media, Post, User, WebSession } from "./app";
import { ActivityDoc } from "./concepts/activities";
import { CarpoolDoc } from "./concepts/carpools";
import { CommentDoc, CommentOptions } from "./concepts/comment";
import { MediaDoc } from "./concepts/media";
import { PostDoc } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";

import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }
  // @Router.get("/sessionUser")
  // async getSessionUserDoc(session: WebSessionDoc) {
  //   const user = WebSession.getUser(session);
  //   return await User.getUserById(user);
  // }

  //// USERS ////

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/usersSearchByUsername")
  async searchUsersByUsername(username?: string) {
    let users;
    if (username) {
      users = await User.searchUsersByUsername(username);
    } else {
      users = await User.getUsers();
    }
    return users;
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string, first_name: string, last_name: string, profile_photo: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password, first_name, last_name, profile_photo);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);

    // Delete all comments associated with the User
    const comments = await Comment.getCommentsByUserId(user);
    await Promise.all(comments.map((comment) => Comment.delete(comment._id)));

    // Delete all posts associated with the User
    const posts = await Post.getPostsByAuthor(user);
    for (const post of posts) {
      // Delete all of the comments underneath the post
      await Comment.deleteByRoot(post._id);
      await Post.delete(post._id);
    }

    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  //// POSTS ////

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getPostsByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.get("/postsSearchByAuthor")
  async searchPostsByAuthor(author?: string) {
    let posts;
    if (author) {
      const users = await User.searchUsersByUsername(author);
      const user_ids = await users.map((user) => user._id);
      const query = { author: { $in: user_ids } };
      posts = await Post.getPosts(query);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.get("/postsByScopeId")
  async getPostsByScopeId(session: WebSessionDoc, scope: ObjectId) {
    scope = new ObjectId(scope);
    const user = WebSession.getUser(session);
    await Activity.isMember(scope, user);
    const posts = await Post.getPostsByScopeId(scope);
    return Responses.posts(posts);
  }

  @Router.get("/postsSearchByUsernameInScopeId")
  async searchPostsByUsernameInScopeId(session: WebSessionDoc, scope: ObjectId, author?: string) {
    scope = new ObjectId(scope);
    const user = WebSession.getUser(session);
    await Activity.isMember(scope, user);
    let posts: Array<PostDoc>;

    if (author) {
      const authors = await User.searchUsersByUsername(author);
      const author_ids = authors.map((author) => author._id);
      posts = await Post.getPostsByScopeId(scope, author_ids);
    } else {
      posts = await Post.getPostsByScopeId(scope);
    }

    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, scope?: ObjectId) {
    if (scope !== undefined) {
      scope = new ObjectId(scope);
    }
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, scope);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    await Comment.deleteByRoot(_id);
    return Post.delete(_id);
  }

  //// FRIENDS ////

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  //// LOCATIONS ////

  @Router.get("/locations")
  async getLocations() {
    return await Location.getLocations();
  }

  @Router.post("/locations")
  async createLocation(street: string, city: string, state: string, country: string, zip_code: number) {
    return await Location.create(street, city, state, country, zip_code);
  }

  @Router.get("/locations/:zip_code")
  async getLocationsInZipCode(session: WebSessionDoc, zip_code: number) {
    // const user = WebSession.getUser(session);
    // await Location.isAuthor(user, _id);
    return Location.getLocationsInZipCode(zip_code);
  }

  @Router.delete("/locations/id/:_id")
  async deleteLocation(session: WebSessionDoc, _id: ObjectId) {
    // const user = WebSession.getUser(session);
    // await Location.isAuthor(user, _id);
    return Location.delete(_id);
  }

  //// MEDIA ////

  @Router.get("/media")
  async getMedia(creator?: string) {
    let media;
    if (creator) {
      const id = (await User.getUserByUsername(creator))._id;
      media = await Media.getMediaByCreator(id);
    } else {
      media = await Media.getMedia({});
    }
    return media;
  }

  @Router.get("/media/:username")
  async getMediaByUsername(username: string) {
    const user = await User.getUserByUsername(username);
    const media = await Media.getMediaByCreator(user._id);
    return { msg: `Successfully retrieved the media ${user.username} uploaded`, media: media };
  }

  @Router.get("/media/byId/:id")
  async getMediaById(id: ObjectId) {
    const media = await Media.getMediaById(id);
    return { msg: `Successfully retrieved the media '${id}'`, media: media };
  }

  @Router.get("/media/byTarget/:target")
  async getMediaByTarget(target: ObjectId) {
    return await Media.getMediaByTarget(target);
  }

  @Router.post("/media")
  async createMedia(session: WebSessionDoc, media_url: string, target?: ObjectId) {
    const user = WebSession.getUser(session);
    const media = await Media.create(user, media_url, target);
    return { msg: media.msg, media: media.media };
  }

  @Router.patch("/media/:_id")
  async updateMedia(session: WebSessionDoc, _id: ObjectId, update: Partial<MediaDoc>) {
    const user = WebSession.getUser(session);
    await Media.isCreator(_id, user);
    return await Media.update(_id, update);
  }

  @Router.delete("/media/:_id")
  async deleteMedia(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Media.isCreator(_id, user);
    return Media.delete(_id, user);
  }

  //// ACTIVITIES ////

  @Router.get("/activities")
  async getActivities(creator?: string) {
    let activities;
    if (creator) {
      const id = (await User.getUserByUsername(creator))._id;
      activities = await Activity.getActivitiesByCreator(id);
    } else {
      activities = await Activity.getActivities({});
    }
    return Responses.activities(activities);
  }

  @Router.get("/activitiesSearchByName")
  async getActivitiesByName(name?: string) {
    let activities;
    if (name) {
      activities = await Activity.searchActivitiesByName(name);
    } else {
      activities = await Activity.getActivities({});
    }
    return Responses.activities(activities);
  }

  @Router.get("/activitiesUserIsMemberOf")
  async getActivitiesUserIsMemberOf(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const activities = await Activity.getActivitiesByMemberId(user);
    return Responses.activities(activities);
  }

  @Router.get("/activities/members/:username")
  async getActivitiesByMemberUsername(username: string) {
    const user = await User.getUserByUsername(username);
    const activities = await Activity.getActivitiesByMemberId(user._id);
    return Responses.activities(activities);
  }

  @Router.get("/activity/id/:id")
  async getActivityById(id: ObjectId) {
    const activity = await Activity.getActivityById(id);
    return Responses.activity(activity);
  }

  @Router.get("/activity/:name")
  async getActivityByName(name: string) {
    const activity = await Activity.getActivityByName(name);
    return Responses.activity(activity);
  }

  @Router.post("/activity")
  async createActivity(session: WebSessionDoc, name: string, join_code: string, location: string) {
    const user = WebSession.getUser(session);
    const activity = await Activity.create(user, name, join_code, location);
    return { msg: activity.msg, activity: activity.activity };
  }

  @Router.patch("/activities/join/:name")
  async joinActivity(session: WebSessionDoc, name: string, join_code: string) {
    const user = WebSession.getUser(session);
    const activity = await Activity.getActivityByName(name);
    const members = await Activity.addUserToActivity(activity._id, user, join_code);
    return {
      msg: `User has been successfully added to the activity '${name}'`,
      members: members,
    };
  }

  @Router.patch("/activities/promote/:username")
  async promoteMemberInActivityByUsername(session: WebSessionDoc, activity_name: string, username: string) {
    const user = WebSession.getUser(session);
    const activity = await Activity.getActivityByName(activity_name);
    const user_to_promote = await User.getUserByUsername(username);
    await Activity.promoteMemberToManager(activity._id, user, user_to_promote._id);
    return {
      msg: `'${user_to_promote.username}' was successfully promoted to a Manager in the activity '${activity.name}'`,
      managers: (await Activity.getActivityById(activity._id)).managers,
    };
  }

  @Router.patch("/activities/demote/:username")
  async demoteManagerInActivityByUsername(session: WebSessionDoc, activity_name: string, username: string) {
    const user = WebSession.getUser(session);
    const activity = await Activity.getActivityByName(activity_name);
    const user_to_demote = await User.getUserByUsername(username);
    await Activity.promoteMemberToManager(activity._id, user, user_to_demote._id);
    return {
      msg: `'${user_to_demote.username}' was successfully demoted to a Member in the activity '${activity.name}'`,
      managers: (await Activity.getActivityById(activity._id)).managers,
    };
  }

  @Router.patch("/activities/kick/:username")
  async kickMemberInActivityByUsername(session: WebSessionDoc, activity_name: string, username_to_kick: string) {
    const user = WebSession.getUser(session);
    const activity = await Activity.getActivityByName(activity_name);
    const user_to_kick = await User.getUserByUsername(username_to_kick);
    await Activity.kickUserFromActivity(activity._id, user, user_to_kick._id);
    return {
      msg: `'${user_to_kick.username}' was successfully kicked from the activity '${activity.name}'`,
      managers: (await Activity.getActivityById(activity._id)).managers,
    };
  }

  @Router.patch("/activities/leave/:activity_name")
  async leaveActivity(session: WebSessionDoc, activity_name: string) {
    const user = WebSession.getUser(session);
    const activity = await Activity.getActivityByName(activity_name);
    try {
      await Activity.removeManagerFromActivity(activity._id, user);
    } catch {
      console.log("NOT A MANAGER");
    }
    await Activity.removeMemberFromActivity(activity._id, user, true);
    return { msg: `User '${user}' has successfully left the activity ${activity.name}'` };
  }

  @Router.patch("/activities/:_id")
  async updateActivity(session: WebSessionDoc, _id: ObjectId, update: Partial<ActivityDoc>) {
    const user = WebSession.getUser(session);
    await Activity.isMember(_id, user);
    return await Activity.update(_id, update);
  }

  @Router.delete("/activities/:_id")
  async deleteActivity(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Activity.isManager(_id, user);
    return Activity.delete(_id, user); // CHANGE THIS TO ISMANAGER
  }

  //// CARPOOLS ////

  @Router.get("/carpools")
  async getCarpools(driver?: string) {
    let carpools;
    if (driver) {
      const id = (await User.getUserByUsername(driver))._id;
      carpools = await Carpool.getCarpoolsByDriver(id);
    } else {
      carpools = await Carpool.getCarpools({});
    }
    return carpools;
  }

  @Router.get("/carpools/:name")
  async getCarpoolByName(name: string) {
    const carpool = await Carpool.getCarpoolByName(name);
    return { msg: `Successfully retrieved the carpool '${name}'`, carpool: carpool };
  }

  @Router.get("/carpools/:id")
  async getCarpoolById(id: ObjectId) {
    const carpool = await Carpool.getCarpoolById(id);
    return { msg: `Successfully retrieved the carpool '${id}'`, carpool: carpool };
  }

  @Router.post("/carpools")
  async createCarpool(session: WebSessionDoc, name: string, target: ObjectId) {
    const user = WebSession.getUser(session);
    const carpool = await Carpool.create(user, name, target);
    return { msg: carpool.msg, carpool: carpool.carpool };
  }

  @Router.patch("/carpools/join/:name")
  async joinCarpool(session: WebSessionDoc, name: string) {
    const user = WebSession.getUser(session);
    const carpool = await Carpool.getCarpoolByName(name);
    await Activity.isMember(carpool.target, user);
    return {
      msg: `User has been successfully added to the carpool '${name}'`,
      members: await Carpool.addUserToCarpool(carpool._id, user),
    };
  }

  // @Router.patch("/carpools/promote/:username")
  // async promoteMemberInCarpoolByUsername(session: WebSessionDoc, carpool_name: string, username: string) {
  //   const user = WebSession.getUser(session);
  //   const carpool = await Carpool.getCarpoolByName(carpool_name);
  //   const user_to_promote = await User.getUserByUsername(username);
  //   await Carpool.promoteMemberToManager(carpool._id, user, user_to_promote._id);
  //   return {
  //     msg: `'${user_to_promote.username}' was successfully promoted to a Manager in the carpool '${carpool.name}'`,
  //     managers: (await Carpool.getCarpoolById(carpool._id)).managers,
  //   };
  // }

  // @Router.patch("/carpools/demote/:username")
  // async demoteManagerInCarpoolByUsername(session: WebSessionDoc, carpool_name: string, username: string) {
  //   const user = WebSession.getUser(session);
  //   const carpool = await Carpool.getCarpoolByName(carpool_name);
  //   const user_to_demote = await User.getUserByUsername(username);
  //   await Carpool.promoteMemberToManager(carpool._id, user, user_to_demote._id);
  //   return {
  //     msg: `'${user_to_demote.username}' was successfully demoted to a Member in the carpool '${carpool.name}'`,
  //     managers: (await Carpool.getCarpoolById(carpool._id)).managers,
  //   };
  // }

  // @Router.patch("/carpools/kick/:username")
  // async kickMemberInCarpoolByUsername(session: WebSessionDoc, carpool_name: string, username_to_kick: string) {
  //   const user = WebSession.getUser(session);
  //   const carpool = await Carpool.getCarpoolByName(carpool_name);
  //   const user_to_kick = await User.getUserByUsername(username_to_kick);
  //   await Carpool.kickUserFromCarpool(carpool._id, user, user_to_kick._id);
  //   return {
  //     msg: `'${user_to_kick.username}' was successfully kicked from the carpool '${carpool.name}'`,
  //     managers: (await Carpool.getCarpoolById(carpool._id)).managers,
  //   };
  // }

  // @Router.patch("/carpools/leave/:carpool_name")
  // async leaveCarpool(session: WebSessionDoc, carpool_name: string) {
  //   const user = WebSession.getUser(session);
  //   const carpool = await Carpool.getCarpoolByName(carpool_name);
  //   await Carpool.removeDriverFromCarpool(carpool._id, user);
  //   await Carpool.removeDriveFromCarpool(carpool._id, user);
  //   return { msg: `User '${user}' has successfully left the carpool ${carpool.name}'` };
  // }

  @Router.patch("/carpools/:_id")
  async updateCarpool(session: WebSessionDoc, _id: ObjectId, update: Partial<CarpoolDoc>) {
    const user = WebSession.getUser(session);
    await Carpool.isMember(_id, user);
    return await Carpool.update(_id, update);
  }

  @Router.delete("/carpools/:_id")
  async deleteCarpool(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Carpool.isDriver(_id, user);
    return Carpool.delete(_id, user);
  }

  //// COMMENTS ////

  @Router.get("/comments")
  async getComments(creator?: string) {
    let comments;
    if (creator) {
      const id = (await User.getUserByUsername(creator))._id;
      comments = await Comment.getCommentsByAuthor(id);
    } else {
      comments = await Comment.getComments({});
    }
    return comments;
  }

  @Router.get("/comments/:target")
  async getCommentsByTarget(target: ObjectId) {
    return await Comment.getCommentsByTarget(target);
  }

  @Router.get("/comments/:root")
  async getCommentsByRoot(root: ObjectId) {
    return await Comment.getCommentsByRoot(root);
  }

  @Router.post("/comments")
  async createComment(session: WebSessionDoc, content: string, target: ObjectId, root?: ObjectId, options?: CommentOptions) {
    const user = WebSession.getUser(session);
    await Post.getPostById(target);
    if (root === undefined) {
      root = target;
    }
    const comment = await Comment.create(user, content, target, root, options);
    return { msg: comment.msg, comment: comment.comment };
  }

  @Router.patch("/comments/:_id")
  async updateComment(session: WebSessionDoc, _id: ObjectId, update: Partial<CommentDoc>) {
    const user = WebSession.getUser(session);
    await Comment.isAuthor(_id, user);
    return await Comment.update(_id, update);
  }

  @Router.delete("/comments/:_id")
  async deleteComment(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Comment.isAuthor(user, _id);
    return Comment.delete(_id);
  }
}

export default getExpressRouter(new Routes());
