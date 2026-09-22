import dotenv from "dotenv";
dotenv.config();

const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
const backendUrl = (process.env.BACKEND_URL || "http://localhost:3000").replace(/\/+$/, "");

export const config = {
  PORT: Number(process.env.PORT || 3000),
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/imessage",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  EMAIL_USER: process.env.EMAIL_USER,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "dev-jwt-secret-change-me",
  FRONTEND_URL: frontendUrl,
  BACKEND_URL: backendUrl,
};
