import { config } from "./config.js";
import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to Database successfully");
  } catch (error) {
    console.error("Error connecting to database:", error.message);
    if (config.NODE_ENV === "production") {
      process.exit(1);
    }
    console.warn("⚠️  Running without a database connection — retrying in 30s…");
    setTimeout(connectDB, 30_000);
  }
}

export default connectDB;