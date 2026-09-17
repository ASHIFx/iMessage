import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGO_URI) throw new Error("MONGO URI is not defined");
if (!process.env.CLOUDINARY_CLOUD_NAME) throw new Error("CLOUDINARY NAME is not defined");

const frontendUrl = process.env.FRONTEND_URL?.split("JWT_SECRET")[0].replace(/\/+$/, "") || undefined;

export const config = {
  PORT: process.env.PORT || 3001,
  MONGO_URI: process.env.MONGO_URI,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  EMAIL_USER: process.env.EMAIL_USER,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URL: frontendUrl,
};
