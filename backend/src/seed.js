import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Message from "./models/message.model.js";
import User from "./models/user.model.js";

dotenv.config();

const demoUsers = [
  {
    email: "maya@example.com",
    fullname: "Maya Chen",
    password: "password123",
    profilePic: "",
  },
  {
    email: "alex@example.com",
    fullname: "Alex Morgan",
    password: "password123",
    profilePic: "",
  },
  {
    email: "sam@example.com",
    fullname: "Sam Rivera",
    password: "password123",
    profilePic: "",
  },
];

const demoMessages = [
  { from: "maya@example.com", to: "alex@example.com", text: "Hey Alex, are we still on for coffee?" },
  { from: "alex@example.com", to: "maya@example.com", text: "Absolutely. I know a great place near the park." },
  { from: "maya@example.com", to: "alex@example.com", text: "Perfect, see you there at 10!" },
  { from: "sam@example.com", to: "maya@example.com", text: "I sent over the photos from yesterday." },
];

async function seed() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not defined");

  await mongoose.connect(process.env.MONGO_URI);

  const users = {};
  for (const demoUser of demoUsers) {
    const hashedPassword = await bcrypt.hash(demoUser.password, 12);
    const user = await User.findOneAndUpdate(
      { email: demoUser.email },
      {
        $set: {
          fullname: demoUser.fullname,
          profilePic: demoUser.profilePic,
          isVerified: true,
        },
        $setOnInsert: { hashedPassword },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    users[demoUser.email] = user;
  }

  const demoUserIds = Object.values(users).map((user) => user._id);
  await Message.deleteMany({
    $or: [{ senderId: { $in: demoUserIds } }, { receiverId: { $in: demoUserIds } }],
  });

  await Message.insertMany(
    demoMessages.map((message) => ({
      senderId: users[message.from]._id,
      receiverId: users[message.to]._id,
      text: message.text,
    })),
  );

  console.log("Seed complete.");
  console.log("Demo password: password123");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
