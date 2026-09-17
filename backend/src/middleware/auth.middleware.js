import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { config } from "../config/config.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-hashedPassword");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    req.user = user;
    next();
  } catch { res.status(401).json({ message: "Invalid or expired token" }); }
};