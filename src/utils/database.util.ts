import mongoose from "mongoose";
import { config } from "../configs";

export const connectDatabase = async (): Promise<void> => {
  const dbUri = <string>config.DB_MONGO_URI;

  try {
    await mongoose.connect(dbUri);
    console.log("  Connected to DB 🎉");
  } catch (err) {
    console.log(`${err} Could not Connect to the Database. Exiting Now...`);
    process.exit(1);
  }
};
