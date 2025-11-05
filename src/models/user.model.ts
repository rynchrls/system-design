import type { ObjectId } from "mongodb";

export interface RSUser {
  _id: ObjectId;
  name: string;
  age: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserModel implements Partial<RSUser> {
  _id: ObjectId;
  name: string;
  age: number;
  createdAt?: Date;
  updatedAt?: Date;
  constructor({ _id, name, age, createdAt = new Date(), updatedAt = new Date() } = {} as RSUser) {
    this._id = _id;
    this.name = name;
    this.age = age;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
