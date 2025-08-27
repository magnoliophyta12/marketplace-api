import { Router } from "express";
import { AdController } from "../controllers/ad-controller.js";
import { upload } from "../middlewares/multer-middleware.js";
import { isAdmin } from "../middlewares/role-middleware.js";
import { TokenController } from "../controllers/token-controller.js";

export const adRoutes = Router();
 
adRoutes.route("/").get(AdController.getAll);  
adRoutes.route("/lowprice").get(AdController.getAllLowPrice);

adRoutes.route("/add").post(upload.array("photos", 10),AdController.create);

adRoutes.route("/search").post(AdController.searchByTitle);

adRoutes.route("/:id/deactivate").put(isAdmin, AdController.deactivateAd);
adRoutes.route("/:id/message").post(TokenController.verifyToken, AdController.SendMessage);
