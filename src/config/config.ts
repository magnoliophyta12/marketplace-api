import "dotenv/config";
import { Sequelize } from "sequelize-typescript";
import { Category } from "../models/category-model.js";
import Token from "../models/token-model.js";
import { Photo } from "../models/photo-model.js";
import { Message } from "../models/message-model.js";
import { Ad } from "../models/ad-model.js";
import { User } from "../models/user-model.js";


export const connection = new Sequelize({
  dialect: "mysql",
  timezone:"+2:00",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,  
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
  models: [User, Ad, Message, Photo, Token, Category], 
});
