import { MongoClient, type Db, type TransactionOptions } from "mongodb";
import { REPL_SHARD_DB, REPL_SHARD_URI } from "../config.js";


let db: Db;
let mongoClient: MongoClient;

export const connectToMongoReplShard = async () => {
  const client = new MongoClient(REPL_SHARD_URI, { maxPoolSize: 10, maxIdleTimeMS: 60000, connectTimeoutMS: 60000 });

  try {
    mongoClient = await client.connect();
    db = mongoClient.db(REPL_SHARD_DB);
    return Promise.resolve("Connected to MongoDB Replication Shard.");
  } catch (error) {
    return Promise.reject("Failed to connect to MongoDB Replica.");
  }
};

export const getDBREPLSHARD = () => {
  if (!db) {
    throw new Error("Database not connected!");
  }
  return db;
};

export const useMongoClientReplShard = () => {
  return mongoClient;
};

export const useTransactionOptions: TransactionOptions = {
  readPreference: "secondary",
  readConcern: { level: "local" },
  writeConcern: { w: "majority" },
};