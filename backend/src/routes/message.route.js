import { Router } from "express";
import * as controller from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import multer from "multer";

const messageRouter = Router();

messageRouter.use(protectRoute);
messageRouter.get("/users", controller.getUserForSidebar);
messageRouter.get("/conversations", controller.getConversationsForSidebar);
messageRouter.get("/:id", controller.getMessage);
messageRouter.post("/send/:id", multer({ storage: multer.memoryStorage() }).single("media"), controller.sendMessage);


export default messageRouter;
