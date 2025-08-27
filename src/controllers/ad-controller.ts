import { Op } from "sequelize";
import { connection } from "../config/config.js";
import { Ad } from "../models/ad-model.js";
import { Category } from "../models/category-model.js";
import { Photo } from "../models/photo-model.js";
import { User } from "../models/user-model.js";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import { Message } from "../models/message-model.js";
import jwt from "jsonwebtoken";
import { clientRedis } from "../config/redis-config.js";

export class AdController {
  static async getAll(req: Request, res: Response): Promise<any> {
    const adsFromRedis=await clientRedis.get("ads");
      if(adsFromRedis){
        console.log("Reading redis..."); 
        return res
        .status(200)
        .json({message:"List of ads",data:JSON.parse(adsFromRedis)});
      }
      const ads = await Ad.scope("available").findAll({
        include: [
          {
            model: User,
            attributes: ["id", "login", "email"],
          },
          {
            model: Category,
            attributes: ["id", "name"],
          },
          {
            model: Photo,
            attributes: ["id", "path"],
          },
        ],
      });

      if (ads) {
        console.log("Writing redis...");
        await clientRedis.set("ads",JSON.stringify(ads),{EX:60});
        return res.status(201).json({ message: "List of ads", data: ads });
      }
    // try {
    //   const ads = await Ad.scope("available").findAll({
    //     include: [
    //       {
    //         model: User,
    //         attributes: ["id", "login", "email"],
    //       },
    //       {
    //         model: Category,
    //         attributes: ["id", "name"],
    //       },
    //       {
    //         model: Photo,
    //         attributes: ["id", "path"],
    //       },
    //     ],
    //   });

    //   res.status(200).json(ads);
    // } catch (error: any) {
    //   console.error("Error fetching ads:", error);
    //   res
    //     .status(500)
    //     .json({ message: "Failed to fetch ads", error: error.message });
    // }
  }
  static async getAllLowPrice(req: Request, res: Response): Promise<any> {
    try {
      const ads = await Ad.scope("lowPrice").findAll({
        include: [
          {
            model: User,
            attributes: ["id", "login", "email"],
          },
          {
            model: Category,
            attributes: ["id", "name"],
          },
          {
            model: Photo,
            attributes: ["id", "path"],
          },
        ],
      });

      res.status(200).json(ads);
    } catch (error: any) {
      console.error("Error fetching ads:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch ads", error: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<any> {
    const { title, price, description, isActive, userId, categoryId } =
      req.body;
    const files = req.files as Express.Multer.File[];

    if (!title || !price || !description || !userId || !categoryId || !files) {
      return res.status(400).json({ error: "All fields are requiered!" });
    }
    if (files && files.length > Number(process.env.MAX_PHOTOS)) {
      return res.status(400).json({
        error: "You can only attach up to 3 photos per ad.",
      });
    }

    const transaction = await connection.transaction();

    try {
      const ad = await Ad.create(
        { title, price, description, isActive, userId, categoryId },
        { transaction }
      );

      const photoRecords = files.map((file) => ({
        id: uuidv4(),
        path: `/uploads/${file.filename}`,
        adId: ad.id,
      }));

      try {
        await Photo.bulkCreate(photoRecords, { transaction });
      } catch (err) {
        console.error("Error while saving photos:", err);
      }

      await transaction.commit();

      res.status(201).json({ message: "Ad added successfully", ad });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({ error: "Db Error" });
    }
  } 
 
  static async searchByTitle(req: Request, res: Response): Promise<any> {
    try {
      const { search } = req.body;

      const ads = await Ad.scope("available").findAll({
        where: { 
          title: {
            [Op.like]: `%${search}%`,
          },
        },
      });

      if (ads.length === 0) {
        return res.status(404).json({ message: "No ads found" });
      }

      res.status(200).json(ads);
    } catch (error: any) {
      console.error("Error while searching:", error);
      res
        .status(500)
        .json({ message: "Error while searching:", error: error.message });
    }
  }

  static async deactivateAd(req: Request, res: Response): Promise<any> {
    const { id } = req.params; 

    try {
      const ad = await Ad.findByPk(id);

      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      ad.isActive = "false";

      await ad.save();

      return res.status(200).json({
        message: "Ad successfully deactivated",
        ad,
      });
    } catch (error: any) {
      console.error("Error deactivating ad:", error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
  static async SendMessage(req:Request,res:Response):Promise<any>{
    const { id: adId } = req.params; 
    const { body } = req.body; 
    const token = req.headers.authorization?.split(" ")[1];
  
    if (!body) {
      return res.status(400).json({ error: "Message body is required." });
    }
  
    if (!token) {
      return res.status(403).json({ error: "Authorization token is required." });
    }
  
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
      const senderId = decoded.userId;
  
      const ad = await Ad.findByPk(adId, { include: [{ model: User, as: "user" }] });
      if (!ad) {
        return res.status(404).json({ error: "Ad not found." });
      }
  
      const receiverId = ad.userId;
  
      if (senderId === receiverId) { 
        return res.status(400).json({ error: "You cannot send a message to yourself." });
      }
  
      const message = await Message.create({
        body,
        senderId,
        receiverId,
        adId,
      });
  
      return res.status(201).json({
        message: "Message sent successfully.",
        data: {
          id: message.id,
          body: message.body,
          senderId: message.senderId,
          receiverId: message.receiverId,
          adId: message.adId,
          createdAt: message.created_at,
        },
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  }

  // static async create(req: Request, res: Response): Promise<any> {
  //   const { title, price, description, isActive, userId, categoryId } =
  //     req.body;
  //   const ad = await Ad.create({
  //     title,
  //     price,
  //     description,
  //     isActive,
  //     userId,
  //     categoryId,
  //   });
  //   if (ad) {
  //     return res
  //       .status(201)
  //       .json({ message: "Ad added successfully", data: ad.dataValues });
  //   }
  //   return res.status(500).json({ message: "Db Error", data: null });
  // }
}
