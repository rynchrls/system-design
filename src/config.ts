import dotenv from "dotenv"

dotenv.config({path: `.env.${process.env.NODE_ENV || "dev"}`})


export const PORT = (process.env.PORT || 5001) as number
export const REDIS_PORT = (process.env.REDIS_PORT || 6379)  as number   
export const MONGO_URI = (process.env.MONGO_URI || "mongodb://localhost:27017/")  as string
export const MONGO_DB = (process.env.MONGO_DB || "system_design_dev")  as string