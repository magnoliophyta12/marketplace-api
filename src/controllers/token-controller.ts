import "dotenv/config";
import {NextFunction, Request, Response } from "express";
import Token from "../models/token-model.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";


const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; 
const JWT_EXPIRE = process.env.JWT_EXPIRE || "1h";

export class TokenController{

  static async generateToken(userId: string): Promise<{ token: string; expireTime: Date }> {
    try { 
      const tokenString = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
      const expireTime = new Date(Date.now() + 60 * 60 * 1000);
   
      await Token.create({
        id: uuidv4(),
        userId,
        token: tokenString,
        expireTime,
      });
  
      return { token: tokenString, expireTime };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to generate token");
    }
  }


  static async verifyToken(req: Request, res: Response,next:NextFunction): Promise<any> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header is required" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      next();
    } catch (error: any) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  }

  static async invalidateToken(req: Request, res: Response): Promise<any>{
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];

    try {
      await Token.destroy({ where: { token } });
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  }
}

