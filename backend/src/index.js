import express from "express";
import { config } from "./config/config.js";
import connectDB from "./config/db.js";
import cors from "cors";
import fs from 'fs';
import path from 'path';
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";
import job from "./config/cron.js";
import { app, server } from "./config/socket.js";

const PORT = config.PORT;
const FRONTEND_URL = config.FRONTEND_URL;
const publicDir = path.join(process.cwd(), "public");

app.use(express.json());
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));

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
  console.log(`Server is running on ${PORT}`);
  if (process.env.NODE_ENV === "production") job.start();
});
