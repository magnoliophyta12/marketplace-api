import {
    Model,
    Table,
    Column,
    DataType,
    HasMany,
  } from "sequelize-typescript";
  import { v4 as uuidv4 } from "uuid";
import { Ad } from "./ad-model.js";
  
  @Table({
    tableName: "categories",
    timestamps: false,
  })
  export class Category extends Model {
    @Column({
      type: DataType.UUID,
      primaryKey: true,
      defaultValue: uuidv4(),
    })
    id!: string;
    @Column({
      type: DataType.STRING,
      allowNull: false,
      unique: true,
    })
    name!: string;
  
    @HasMany(() => Ad)
    posts!: Ad[];
  }