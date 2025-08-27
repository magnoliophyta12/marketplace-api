import { Router } from "express";
import { CategoryController } from "../controllers/category-controller.js";

export const categoryRoutes = Router();

categoryRoutes.route("/").post(CategoryController.getAll);

categoryRoutes.route("/add").post(CategoryController.create); 
