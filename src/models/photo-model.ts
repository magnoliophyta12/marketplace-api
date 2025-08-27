import {
    Model,
    Table,
    Column,
    DataType,
    HasMany,
    BelongsToMany,
    ForeignKey,
    BelongsTo,
  } from "sequelize-typescript";
  import { v4 as uuidv4 } from "uuid";
import { Ad } from "./ad-model.js";

  
  @Table({
    tableName: "photos",
    timestamps: false,
  })
  export class Photo extends Model {
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
    path!: string;

    @ForeignKey(()=>Ad)
    @Column({
        type:DataType.UUID
    })
    adId!:string;

    @BelongsTo(()=>Ad)
    ad!:Ad;
  
  }