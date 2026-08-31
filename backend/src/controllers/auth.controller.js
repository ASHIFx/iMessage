import bcrypt from "bcryptjs";
import User from "../models/user.model";
import { sendEmail } from "../utils/sendEmail";
import otpModel from "../models/otp.model";

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
