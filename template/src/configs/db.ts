import mongoose from "mongoose";
import { ENV } from "./env";

export const connectToDB = async () => {
  const uri = ENV.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI not found in .env");

  await mongoose.connect(uri);
  console.log("✅ MongoDB connected");
};
