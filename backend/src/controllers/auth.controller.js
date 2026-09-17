import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { config } from "../config/config.js";

const publicUser = (user) => ({
  _id: user._id,
  email: user.email,
  fullName: user.fullname,
  fullname: user.fullname,
  profilePic: user.profilePic,
  isVerified: user.isVerified,
});

export const register = async (req, res) => {
  try {
    const { email, password, username, fullname } = req.body;
    if (!email || !password || !(username || fullname)) return res.status(400).json({ message: "Email, password, and name are required" });
    if (await User.findOne({ email })) return res.status(409).json({ message: "User already exists" });
    const user = await User.create({ email, fullname: fullname || username, hashedPassword: await bcrypt.hash(password, 12), isVerified: true });
    res.status(201).json({ user: publicUser(user) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password || "", user.hashedPassword))) return res.status(401).json({ message: "Email or password is incorrect" });
    const accessToken = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "10m" });
    res.cookie("refreshToken", accessToken, { httpOnly: true, sameSite: "lax", secure: config.NODE_ENV === "production", maxAge: 10 * 24 * 60 * 60 * 1000 });
    res.json({ user: publicUser(user), accessToken });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const me = (req, res) => res.json(publicUser(req.user));
export const logout = (_req, res) => { res.clearCookie("refreshToken"); res.json({ message: "Logged out successfully" }); };
export const sendOtp = (_req, res) => res.status(410).json({ message: "Email verification is not required for this development build" });
export const verifyOtp = (_req, res) => res.status(410).json({ message: "Email verification is not required for this development build" });
export const refreshToken = (req, res) => { if (!req.cookies?.refreshToken) return res.status(401).json({ message: "Refresh token not found" }); res.json({ accessToken: req.cookies.refreshToken }); };
