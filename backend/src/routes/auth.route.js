import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", controller.register);
authRouter.post("/sendotp", controller.sendOtp);
authRouter.post("/verify-email", controller.verifyOtp);
authRouter.post("/login", controller.login);
authRouter.post("/logout", protect, controller.logout);
authRouter.post("/refreshToken", controller.refreshToken);

export default authRouter;
