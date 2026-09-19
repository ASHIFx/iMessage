import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";
import { config } from "../config/config.js";
import { sendEmail } from "../utils/sendEmail.js";
import { hasCloudinaryConfig, uploadChatMedia } from "../config/cloudinary.js";

const publicUser = (user) => ({
  _id: user._id,
  email: user.email,
  fullName: user.fullname,
  fullname: user.fullname,
  profilePic: user.profilePic,
  isVerified: user.isVerified,
});

function signToken(userId) {
  return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: "10d" });
}

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.NODE_ENV === "production",
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
  });
}

export const register = async (req, res) => {
  try {
    const { email, password, username, fullname } = req.body;
    if (!email || !password || !(username || fullname))
      return res.status(400).json({ message: "Email, password, and name are required" });
    if (await User.findOne({ email }))
      return res.status(409).json({ message: "User already exists" });

    const user = await User.create({
      email,
      fullname: fullname || username,
      hashedPassword: await bcrypt.hash(password, 12),
      isVerified: false,
    });
    await issueOtp(user, res, 201);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password || "", user.hashedPassword)))
      return res.status(401).json({ message: "Email or password is incorrect" });

    await issueOtp(user, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const me = (req, res) => res.json({ user: publicUser(req.user) });
export const logout = (_req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};
async function issueOtp(user, res, status = 200) {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  await Otp.deleteMany({ email: user.email });
  await Otp.create({
    user: user._id,
    email: user.email,
    otpHash: await bcrypt.hash(otp, 10),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  const message = `<p>Your iMessage verification code is <strong>${otp}</strong>.</p><p>This code expires in 10 minutes.</p>`;
  if (config.BREVO_API_KEY && config.EMAIL_USER) {
    await sendEmail({ email: user.email, subject: "Your iMessage verification code", message });
  } else if (config.NODE_ENV !== "production") {
    console.log(`Development OTP for ${user.email}: ${otp}`);
  } else {
    return res.status(503).json({ message: "OTP email delivery is not configured" });
  }

  const response = { requiresOtp: true, message: "A verification code was sent to your email" };
  if (config.NODE_ENV !== "production" && !(config.BREVO_API_KEY && config.EMAIL_USER)) response.devOtp = otp;
  return res.status(status).json(response);
}

export const sendOtp = async (req, res) => {
  try {
    const { email, password, fullname, username } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    let user = await User.findOne({ email });
    if (!user) {
      if (!(fullname || username)) return res.status(400).json({ message: "Name is required for registration" });
      user = await User.create({ email, fullname: fullname || username, hashedPassword: await bcrypt.hash(password, 12), isVerified: false });
    } else if (!(await bcrypt.compare(password, user.hashedPassword))) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    return issueOtp(user, res);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !/^\d{6}$/.test(String(otp || ""))) return res.status(400).json({ message: "Enter the 6-digit verification code" });
    const record = await Otp.findOne({ email });
    if (!record || record.expiresAt <= new Date()) return res.status(400).json({ message: "This code has expired. Request a new one" });
    if (!(await bcrypt.compare(String(otp), record.otpHash))) return res.status(400).json({ message: "Invalid verification code" });
    const user = await User.findByIdAndUpdate(record.user, { isVerified: true }, { new: true }).select("-hashedPassword");
    await Otp.deleteMany({ email });
    const accessToken = signToken(user._id);
    setRefreshCookie(res, accessToken);
    return res.json({ user: publicUser(user), accessToken });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, profilePic } = req.body;
    if (!fullname?.trim() && profilePic === undefined && !req.file) return res.status(400).json({ message: "Provide a name or profile image" });
    const updates = {};
    if (fullname?.trim()) updates.fullname = fullname.trim();
    if (profilePic !== undefined) updates.profilePic = profilePic;
    if (req.file) {
      if (!hasCloudinaryConfig()) return res.status(503).json({ message: "Profile image uploads are not configured" });
      updates.profilePic = await uploadChatMedia(req.file);
    }
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true }).select("-hashedPassword");
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const refreshToken = (req, res) => {
  if (!req.cookies?.refreshToken)
    return res.status(401).json({ message: "Refresh token not found" });
  res.json({ accessToken: req.cookies.refreshToken });
};
