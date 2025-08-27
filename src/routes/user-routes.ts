import { Router } from "express";
import { UserController } from "../controllers/user-controller.js";
import { isAdmin } from "../middlewares/role-middleware.js";

export const userRoutes = Router();

userRoutes.route("/signup").post(UserController.signUp);

userRoutes.route("/signin").post(UserController.signIn);

userRoutes.route("/logout").post(UserController.logout);

userRoutes.route("/forgot-password").post(UserController.sendResetPasswordEmail);

userRoutes.route("/reset-password/:tokenId/:token").post(UserController.resetPassword);

userRoutes.route("/create").post(isAdmin,UserController.signUp);

userRoutes.route("/:id").put(isAdmin, UserController.updateUser);
