import crypto from "crypto";
import "dotenv/config";
import { User } from "../models/user-model.js";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { TokenController } from "./token-controller.js";
import Token from "../models/token-model.js";
import nodemailer from "nodemailer";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
});

export class UserController {
  static async signUp(req: Request, res: Response): Promise<any> {
    const { login, email, password, role = "user" } = req.body;

    if (!login || !email || !password) {
      return res
        .status(400)
        .json({ error: "All fields are required: login, email, and password" });
    }

    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: "Email is already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        login,
        email,
        password: hashedPassword,
        role,
      });

      res.status(201).json({
        message: "User registered successfully",
        userId: user.id,
        role: user.role,
      });
    } catch (error: any) {
      console.error("Error during sign-up:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async signIn(req: Request, res: Response): Promise<any> {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ error: "User not found" });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return res.status(401).json({ error: "Invalid credentials" });

      const tokenData = await TokenController.generateToken(user.id);
      res.status(200).json(tokenData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async logout(req: Request, res: Response): Promise<any> {
    try {
      await TokenController.invalidateToken(req, res);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async sendResetPasswordEmail(
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).send("User not found.");
      }

      let token = await Token.findOne({
        where: { userId: user.id, type: "reset_password" },
      });
      if (!token) {
        token = await Token.create({
          userId: user.id,
          token: crypto.randomBytes(32).toString("hex"),
          type: "reset_password",
          expireTime: new Date(Date.now() + 60 * 60 * 1000),
        });
      }

      const resetLink = `https://127.0.0.1/users/reset-password/${token.id}/${token.token}`;

      await transporter.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: "Password reset",
        html: `
          <h1>Password reset</h1>
          <a href="${resetLink}">${resetLink}</a>
          <p>Link expires in 1 hour.</p>
        `,
      });

      return res
        .status(200)
        .send(
          `Link sent to email: ${resetLink}`
        );
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error");
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<any> {
    try {
      const { tokenId, token } = req.params;
      const { newPassword } = req.body;

      const tokenRecord = await Token.findOne({
        where: { id: tokenId, token },
      });
      if (!tokenRecord) {
        return res.status(400).send("Invalid or expired token.");
      }

      if (tokenRecord.expireTime < new Date()) {
        return res.status(400).send("Token expired.");
      }

      const user = await User.findOne({ where: { id: tokenRecord.userId } });
      if (!user) {
        return res.status(400).send("User not found.");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword; 
      await user.save();

      await Token.destroy({ where: { id: tokenId } });

      return res.status(200).send("Password changed."); 
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error while changing password.");
    }
  }

  static async updateUser(req: Request, res: Response): Promise<any> {
    const { login, email, password, role } = req.body;
    const { id } = req.params;

    if (!login || !email || !password || !role) {
      return res.status(400).json({
        error: "All fields (login, email, password, role) are required",
      });
    }

    try {
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.login = login;
      user.email = email;
      user.role = role;

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;

      await user.save();

      return res.status(200).json({
        message: "User data successfully updated",
        userId: user.id,
        login: user.login,
        email: user.email,
        role: user.role,
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
}
