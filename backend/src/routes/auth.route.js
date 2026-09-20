import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import multer from "multer";

const authRouter = Router();

authRouter.post("/register", controller.register);
authRouter.post("/login", controller.login);
authRouter.get("/me", protectRoute, controller.me);
authRouter.post("/logout", controller.logout);
authRouter.post("/refreshToken", controller.refreshToken);
authRouter.patch(
  "/profile",
  protectRoute,
  multer({ storage: multer.memoryStorage() }).single("profilePic"),
  controller.updateProfile,
);

export default authRouter;
