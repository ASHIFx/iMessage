import jwt from "jsonwebtoken";
import { config } from "../config/config";

export const accessToken = (req, res) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: "10m" });
};
export const refreshToken = (req, res) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: "10d" });
};
