import { ObjectId } from "mongodb";

export const convertToObjectId = (id: string | ObjectId): ObjectId => {
  return new ObjectId(id);
};
