import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export const accessToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: "10m" });
};
export const refreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: "10d" });
};
