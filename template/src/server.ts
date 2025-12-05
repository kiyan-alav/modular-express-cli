import dotenv from "dotenv";
import app from "./app";
import { connectToDB } from "./configs/db";
import { ENV } from "./configs/env";

dotenv.config();

const PORT = ENV.PORT;

connectToDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ DB connection failed:", err));
