import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../../server/framework/doc";

export interface UserDoc {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  profile_photo: string;
}

export interface ActivityDoc extends BaseDoc {
  name: string;
  location: string;
  members: Array<ObjectId>;
  creator: ObjectId;
  managers: Array<ObjectId>;
  carpools: Array<ObjectId>;
}
