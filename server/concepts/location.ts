import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface LocationDoc extends BaseDoc {
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code: number;
}

export default class LocationConcept {
  public readonly locations = new DocCollection<LocationDoc>("locations");

  async create(street: string, city: string, state: string, country: string, zip_code: number) {
    await this.canCreate(street, city, state, country, zip_code);

    try {
      // Return already existing location if one already exists
      const locationExists = await this.getLocationByAddress(street, city, state, country, zip_code);
      return { msg: "Location already exists and is being returned!", location: locationExists };
    } catch {
      const _id = await this.locations.createOne({ street, city, state, country, zip_code });
      return { msg: "Location created successfully!", location: await this.locations.readOne({ _id }) };
    }
    // return await this.getLocationByAddress(street, city, state, country, zip_code).catch((Error) => {
    //   const _id = await this.locations.createOne({ street, city, state, country, zip_code });
    //   return { msg: "Location created successfully!", location: await this.locations.readOne({ _id }) };
    // }).then(() => {
    //   return { msg: "Location already exists and is being returned!", location: await locationExists };
    // })
  }

  // private sanitizeLocation(location: LocationDoc) {
  //   // eslint-disable-next-line
  //   const { password, ...rest } = user; // remove password
  //   return rest;
  // }

  async getLocationById(_id: ObjectId) {
    const location = await this.locations.readOne({ _id });
    if (location === null) {
      throw new LocationNotFoundInDBError(_id);
    }
    return location;
    // return this.sanitizeUser(location);
  }

  async getLocationByAddress(street: string, city: string, state: string, country: string, zip_code: number) {
    const location = await this.locations.readOne({ street, city, state, country, zip_code });
    if (location === null) {
      throw new NotFoundError(`Location not found in the database!`);
    }
    return location;
    // return this.sanitizeUser(user);
  }

  // async idsToUsernames(ids: ObjectId[]) {
  //   const users = await this.locations.readMany({ _id: { $in: ids } });

  //   // Store strings in Map because ObjectId comparison by reference is wrong
  //   const idToUser = new Map(users.map((user) => [user._id.toString(), user]));
  //   return ids.map((id) => idToUser.get(id.toString())?.username ?? "DELETED_USER");
  // }

  async getLocationsInZipCode(zip_code: number) {
    const locations = await this.locations.readMany(
      { zip_code },
      {
        sort: { dateUpdated: -1 },
      },
    );
    if (locations === null) {
      throw new LocationNotFoundInDBError(String(zip_code));
    }
    return locations;
  }

  async getLocationsInCity(city: string) {
    const locations = await this.locations.readMany(
      { city },
      {
        sort: { dateUpdated: -1 },
      },
    );
    if (locations === null) {
      throw new LocationNotFoundInDBError(city);
    }
    return locations;
  }

  async getLocations() {
    return await this.locations.readMany(
      {},
      {
        sort: { dateUpdated: -1 },
      },
    );
  }

  // async getUsers(username?: string) {
  //   // If username is undefined, return all users by applying empty filter
  //   const filter = username ? { username } : {};
  //   const users = (await this.users.readMany(filter)).map(this.sanitizeUser);
  //   return users;
  // }

  // async authenticate(username: string, password: string) {
  //   const user = await this.users.readOne({ username, password });
  //   if (!user) {
  //     throw new NotAllowedError("Username or password is incorrect.");
  //   }
  //   return { msg: "Successfully authenticated.", _id: user._id };
  // }

  async update(_id: ObjectId, update: Partial<LocationDoc>) {
    // if (update.username !== undefined) {
    //   await this.isUsernameUnique(update.username);
    // }
    await this.locations.updateOne({ _id }, update);
    return { msg: "Location updated successfully!" };
  }

  async delete(_id: ObjectId) {
    await this.locations.deleteOne({ _id });
    return { msg: "Location deleted!" };
  }

  async locationExists(_id: ObjectId) {
    const maybeLocation = await this.locations.readOne({ _id });
    if (maybeLocation === null) {
      throw new LocationNotFoundInDBError(_id);
    }
  }

  private async canCreate(street: string, city: string, state: string, country: string, zip_code: number) {
    // if (zip_code ~ instanceof number) {
    //   throw new BadValuesError("Username and password must be non-empty!");
    // }
    // await this.isUsernameUnique(username);
    if (String(zip_code).length !== 5) {
      throw new BadValuesError(`zip code is not 5 characters long`);
    }
  }

  // private async isUsernameUnique(username: string) {
  //   if (await this.users.readOne({ username })) {
  //     throw new NotAllowedError(`User with username ${username} already exists!`);
  //   }
  // }
}

export class LocationNotFoundInDBError extends NotAllowedError {
  constructor(public readonly location: ObjectId | string) {
    super(`${location} does not exist in the Database!`);
  }
}

export class InvalidLocationError extends NotAllowedError {
  constructor(public readonly location: ObjectId) {
    super(`${location} does not exist on Earth!`);
  }
}
