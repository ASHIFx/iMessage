import express from "express";
import { config } from "./config/config.js";
import connectDB from "./config/db.js";
import cors from "cors";
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = config.PORT;
const publicDir = path.join(process.cwd(), "public");

app.use(express.json());
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
}); 

if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir))

    app.get("/{*any}", (res,res,next) => {
        res.sendFile(path.join(publicDir, "index.html")), (err) => next(err);
    })
}

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on ${PORT}`);
});
