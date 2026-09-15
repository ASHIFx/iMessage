import { Router } from "express";
import * as controller from "../controllers/message.controller.js";

const messageRouter = Router();

messageRouter.get("/users", controller.getUserForSidebar);


export default messageRouter;
