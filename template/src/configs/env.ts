import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  MONGO_URI: process.env.MONGO_URI || "",
  PORT: process.env.PORT || 5000,
  ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY || "",
  REFRESH_TOKEN_KEY: process.env.REFRESH_TOKEN_KEY || "",
  BASE_URL: process.env.BASE_URL || "",
};
