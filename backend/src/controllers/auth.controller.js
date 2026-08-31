import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import otpModel from "../models/otp.model.js";
import * as gen from "../utils/generateToken.js";
import sessionModel from "../models/session.model.js";

export const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username)
      return res.status(400).json({ message: "All field are required" });

    const isAlreadExist = await User.findOne({
      $or: [{ email }],
    });

    if (isAlreadExist)
      return res.status(400).json({ message: "User already exist" });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const isAlreadExist = await User.findOne({
      $or: [{ email }],
    });

    if (!isAlreadExist)
      return res.status(400).json({ message: "Please register first" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpHash = await bcrypt.hash(`${otp}`, salt);
    const message = `
                <h2>Welcome to ShopNest, ${username}!</h2>
                <p>Thank you for registering on our platform.</p>
                <p>Your one-time verification OTP is: <strong>${otp}</strong></p>
                `;

    await otpModel.create({
      user: user_.id,
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmail({
      email,
      subject: "Welcome to iMessage - Your OTP",
      message,
    });

    return res.status(201).json({
      message: `User registered successfully. OTP sent to ${email}`,
      user: {
        username: User.username,
        email: User.email,
        isVerified: User.isVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpDoc = await otpModel.findOne({
      email,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) return res.status(401).json({ message: "Invalid OTP" });

    const isMatch = await bcrypt.compare(`${otp}`, otpDoc.otpHash);

    if (!isMatch) return res.status(401).json({ message: "Invalid OTP" });

    const user = await User.findByIdAndUpdate(
      otpDoc.user,
      { isVerified: true },
      { new: true },
    );

    await otpModel.deleteMany({ user: otpDoc.user });

    const accessToken = gen.accessToken(user._id);
    const refreshToken = gen.refreshToken(user._id);

    const salt = await bcrypt.genSalt(12);
    const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

    await sessionModel.create({
      user: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      message: "Email verified successfully",
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password)
      return res.status(400).json({ message: "password is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not exist" });

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = gen.accessToken(user._id);
      const refreshToken = gen.refreshToken(user._id);

      const salt = await bcrypt.genSalt(10);
      const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

      await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 10 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Logged in successfully",
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        accessToken,
      });
    }

    return res.status(400).json({ message: "Username or password is wrong" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user) {
      await sessionModel.updateMany(
        { user: req.user._id, revoke: false },
        { revoke: true },
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "refresh token not found",
    });
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

  const salt = await genSalt(12);
  const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoke: false,
  });

  if (!session) {
    return res.status(401).json({
      message: "invalid refresh token",
    });
  }

  const accessToken = jwt.sign(
    {
      id: decoded.id,
      sessionId: session._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "10m",
    },
  );

  const newRefreshToken = jwt.sign(
    {
      id: decoded.id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "10d",
    },
  );

  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, salt);
  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 10 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    message: "access token refreshed successfully",
    accessToken,
  });
}