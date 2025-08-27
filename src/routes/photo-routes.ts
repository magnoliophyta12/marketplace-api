import { Router } from "express";
import { PhotoController } from "../controllers/photo-controller.js";

export const photoRoutes = Router();

photoRoutes.route("/").post(PhotoController.getAll);

photoRoutes.route("/add").post(PhotoController.create); 