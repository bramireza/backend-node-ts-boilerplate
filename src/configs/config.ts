import dotenv from "dotenv";

dotenv.config();

export default {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "8000",
  FRONT_URL: process.env.FRONT_URL || "http://localhost:3000/",
  DB_MONGO_URI: process.env.DB_MONGO_URI,

  JWT: {
    ACCESS_TOKEN: {
      SECRET: process.env.JWT_ACCESS_TOKEN_SECRET || "mySecretToken",
      EXP: process.env.JWT_ACCESS_TOKEN_EXPIRATION || "1h",
    },
    REFRESH_TOKEN: {
      SECRET: process.env.JWT_REFRESH_TOKEN_SECRET || "mySecretToken2",
      EXP: process.env.JWT_REFRESH_TOKEN_EXPIRATION || "1d",
    },
  },
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  },
};
