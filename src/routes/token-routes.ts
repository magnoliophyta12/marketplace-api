import { Router } from "express";
import { TokenController } from "../controllers/token-controller.js";

export const tokenRoutes=Router();



tokenRoutes.route("/verify").post(TokenController.verifyToken);