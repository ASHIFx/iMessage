import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { config } from "../config/config.js";
import { hasCloudinaryConfig, uploadChatMedia } from "../config/cloudinary.js";

const publicUser = (user) => ({
  _id: user._id,
  email: user.email,
  fullName: user.fullname,
  fullname: user.fullname,
  profilePic: user.profilePic,
});

function signToken(userId) {
  return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: "10d" });
}

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.NODE_ENV === "production",
    maxAge: 10 * 24 * 60 * 60 * 1000,
  });
}

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { email, password, fullname, username } = req.body;
    if (!email || !password || !(fullname || username))
      return res.status(400).json({ message: "Email, password, and name are required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    if (await User.findOne({ email }))
      return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({
      email,
      fullname: fullname || username,
      hashedPassword: await bcrypt.hash(password, 12),
    });

    const accessToken = signToken(user._id);
    setRefreshCookie(res, accessToken);
    return res.status(201).json({ user: publicUser(user), accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.hashedPassword)))
      return res.status(401).json({ message: "Invalid email or password" });

    const accessToken = signToken(user._id);
    setRefreshCookie(res, accessToken);
    return res.json({ user: publicUser(user), accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
export const me = (req, res) => res.json({ user: publicUser(req.user) });

// POST /api/auth/logout
export const logout = (_req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};

// POST /api/auth/refreshToken
export const refreshToken = (req, res) => {
  if (!req.cookies?.refreshToken)
    return res.status(401).json({ message: "Refresh token not found" });
  res.json({ accessToken: req.cookies.refreshToken });
};

// PATCH /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { fullname, profilePic } = req.body;
    if (!fullname?.trim() && profilePic === undefined && !req.file)
      return res.status(400).json({ message: "Provide a name or profile image" });

    const updates = {};
    if (fullname?.trim()) updates.fullname = fullname.trim();
    if (profilePic !== undefined) updates.profilePic = profilePic;
    if (req.file) {
      if (!hasCloudinaryConfig())
        return res.status(503).json({ message: "Profile image uploads are not configured" });
      updates.profilePic = await uploadChatMedia(req.file);
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-hashedPassword");
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
