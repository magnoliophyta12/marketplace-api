import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user-model.js";


export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<any>  => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
  
      if (!token) {
        return res.status(403).json({ message: "No authorization" });
      }
  
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
  
      const user = await User.findByPk(decoded.userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
  
      next();
    } catch (error:any) {
      console.error(error);
      return res.status(500).json({ message: "Authorization error", error: error.message });
    }
  };
  