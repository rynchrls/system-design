import { MongoClient, type Db, type TransactionOptions } from "mongodb";
import { MONGO_DB, MONGO_URI } from "../config.js";


let db: Db;
let mongoClient: MongoClient;

export const connectToMongo = async () => {
  const client = new MongoClient(MONGO_URI, { maxPoolSize: 10, maxIdleTimeMS: 60000, connectTimeoutMS: 60000 });

  try {
    mongoClient = await client.connect();
    db = mongoClient.db(MONGO_DB);
    return Promise.resolve("Connected to MongoDB.");
  } catch (error) {
    return Promise.reject("Failed to connect to MongoDB.");
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error("Database not connected!");
  }
  return db;
};

export const useMongoClient = () => {
  return mongoClient;
};

export const useTransactionOptions: TransactionOptions = {
  readPreference: "primary",
  readConcern: { level: "local" },
  writeConcern: { w: "majority" },
};