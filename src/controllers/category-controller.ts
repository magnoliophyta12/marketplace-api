import { Ad } from "../models/ad-model.js";
import { Category } from "../models/category-model.js";
import { Photo } from "../models/photo-model.js";
import { User } from "../models/user-model.js";
import { Request, Response } from "express";

export class CategoryController {
  static async create(req: Request, res: Response): Promise<any> {
    const { name } = req.body;

    const category = await Category.create({
      name,
    });

    if (category) {
      return res
        .status(201)
        .json({ message: "Category added successfully", data: category.dataValues });
    }
    return res.status(500).json({ message: "Db Error", data: null });
  }

  static async getAll(req: Request, res: Response): Promise<any> {
    try {
      const categories = await Category.findAll();
      res.status(200).json(categories);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch categories", error: error.message });
    }
  }
}
