import { Ad } from "../models/ad-model.js";
import { Category } from "../models/category-model.js";
import { Photo } from "../models/photo-model.js";
import { User } from "../models/user-model.js";
import { Request, Response } from "express";

export class PhotoController {
  static async create(req: Request, res: Response): Promise<any> {
    const { path } = req.body;

    const photo = await Photo.create({
      path,
    });

    if (photo) {
      return res
        .status(201)
        .json({ message: "Photo added successfully", data: photo.dataValues });
    }
    return res.status(500).json({ message: "Db Error", data: null });
  }

  static async getAll(req: Request, res: Response): Promise<any> {
    try {
      const photos = await Photo.findAll();
      res.status(200).json(photos);
    } catch (error: any) {
      console.error("Error fetching photos:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch photos", error: error.message });
    }
  }
}
