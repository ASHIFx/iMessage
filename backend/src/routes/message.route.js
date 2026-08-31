import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";

const messageRouter = Router();

messageRouter.get("/users", controller.d);


export default messageRouter;
