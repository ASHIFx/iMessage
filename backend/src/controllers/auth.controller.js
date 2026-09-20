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

async function issueOtp(user, res, status = 200) {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  await Otp.deleteMany({ email: user.email });
  await Otp.create({
    user: user._id,
    email: user.email,
    otpHash: await bcrypt.hash(otp, 10),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  const html = `
    <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
      <h2 style="margin:0 0 8px;font-size:20px">Your iMessage code</h2>
      <p style="margin:0 0 20px;color:#6b7280">Use this code to verify your email address. It expires in 10 minutes.</p>
      <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700">${otp}</div>
    </div>`;

  let emailSent = false;
  if (config.BREVO_API_KEY && config.EMAIL_USER) {
    try {
      await sendEmail({ email: user.email, subject: "Your iMessage verification code", message: html });
      emailSent = true;
    } catch (err) {
      if (config.NODE_ENV === "production") {
        return res.status(503).json({ message: "Failed to send verification email. Please try again." });
      }
      console.warn("⚠️  sendEmail failed:", err.message);
    }
  }

  if (!emailSent) {
    if (config.NODE_ENV === "production") {
      return res.status(503).json({ message: "Email service not configured." });
    }
    console.log(`\n🔑  Dev OTP for ${user.email}: ${otp}\n`);
  }

  const body = {
    requiresOtp: true,
    message: emailSent ? "Verification code sent to your email" : "Dev mode – check server console for code",
  };
  if (!emailSent) body.devOtp = otp;        // expose in dev so UI can autofill
  return res.status(status).json(body);
}

// ── POST /api/auth/register ────────────────────────────────────────────────────
// Creates the account then fires an OTP – user must verify before getting a token
export const register = async (req, res) => {
  try {
    const { email, password, fullname, username } = req.body;
    if (!email || !password || !(fullname || username))
      return res.status(400).json({ message: "Email, password and name are required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.isVerified) {
        // Fully verified account — tell them to sign in
        return res.status(409).json({ message: "Email already in use. Please sign in instead." });
      }
      // Account exists but never verified — resend OTP so they can complete registration
      return issueOtp(existing, res, 200);
    }

    const user = await User.create({
      email,
      fullname: fullname || username,
      hashedPassword: await bcrypt.hash(password, 12),
      isVerified: false,
    });

    return issueOtp(user, res, 201);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/verify-email ────────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !/^\d{6}$/.test(String(otp || "")))
      return res.status(400).json({ message: "Enter the 6-digit code" });

    const record = await Otp.findOne({ email });
    if (!record || record.expiresAt <= new Date())
      return res.status(400).json({ message: "Code expired – request a new one" });
    if (!(await bcrypt.compare(String(otp), record.otpHash)))
      return res.status(400).json({ message: "Invalid code" });

    const user = await User.findByIdAndUpdate(record.user, { isVerified: true }, { new: true });
    await Otp.deleteMany({ email });
    const accessToken = signToken(user._id);
    setRefreshCookie(res, accessToken);
    return res.json({ user: publicUser(user), accessToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/sendotp  (resend) ──────────────────────────────────────────
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account with that email" });
    return issueOtp(user, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────────────────
// Direct – no OTP for login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.hashedPassword)))
      return res.status(401).json({ message: "Invalid email or password" });

    // Account exists, password correct, but email never verified → resend OTP
    if (!user.isVerified) {
      return issueOtp(user, res, 200);
    }

    const accessToken = signToken(user._id);
    setRefreshCookie(res, accessToken);
    return res.json({ user: publicUser(user), accessToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const me = (req, res) => res.json({ user: publicUser(req.user) });

export const logout = (_req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};

export const refreshToken = (req, res) => {
  if (!req.cookies?.refreshToken)
    return res.status(401).json({ message: "Refresh token not found" });
  res.json({ accessToken: req.cookies.refreshToken });
};

// ── PATCH /api/auth/profile ────────────────────────────────────────────────────
// Accepts base64 profilePic in JSON body OR multipart file (Cloudinary fallback)
export const updateProfile = async (req, res) => {
  try {
    const { fullname, profilePic } = req.body;
    if (!fullname?.trim() && profilePic === undefined && !req.file)
      return res.status(400).json({ message: "Provide a name or photo" });

    const updates = {};
    if (fullname?.trim()) updates.fullname = fullname.trim();
    if (profilePic !== undefined) updates.profilePic = profilePic;   // base64 data-URL
    if (req.file) {
      if (!hasCloudinaryConfig())
        return res.status(503).json({ message: "Profile image uploads not configured" });
      updates.profilePic = await uploadChatMedia(req.file);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-hashedPassword");
    return res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
