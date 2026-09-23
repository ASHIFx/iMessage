import express from "express";
import { config } from "./config/config.js";
import connectDB from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";
import job from "./config/cron.js";
import { app, server } from "./config/socket.js";

const PORT = config.PORT;
const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");

app.use(express.json({ limit: "12mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        config.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
}); 

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);


if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir))

    app.get("/{*any}", (req, res, next) => {
      res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
    })
}

server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV === "production") job.start();
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Kill the process using it and try again.`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});
