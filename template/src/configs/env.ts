import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/mongodbName",
  PORT: process.env.PORT || 5000,
  ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY || "secret",
  REFRESH_TOKEN_KEY: process.env.REFRESH_TOKEN_KEY || "secret",
  BASE_URL: process.env.BASE_URL || "http://localhost:5000",
};
