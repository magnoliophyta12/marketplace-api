import {
    Model,
    Table,
    Column,
    DataType,
    HasMany,
    HasOne,
    Default,
    ForeignKey,
    BelongsTo,
  } from "sequelize-typescript";
  import {v4 as uuidv4} from "uuid";
import { Ad } from "./ad-model.js";
import { User } from "./user-model.js";
  
  
  @Table({
    tableName: "messages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  })
  export class Message extends Model {
    @Column({
      type: DataType.UUID,
      primaryKey: true,
      defaultValue:uuidv4(),
    })
    id!: string;
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    body!: string;

    @Default(DataType.NOW)
    @Column({
      type: DataType.DATE,
    })
    created_at!: Date;
  
    @Default(DataType.NOW)
    @Column({
      type: DataType.DATE,
    })
    updated_at!: Date;


    @ForeignKey(()=>User)
    @Column({
        type:DataType.UUID
    })
    senderId!:string;

    @ForeignKey(()=>User)
    @Column({
        type:DataType.UUID
    })
    receiverId!:string;

    @ForeignKey(()=>Ad)
    @Column({
        type:DataType.UUID
    })
    adId!:string;

    @BelongsTo(() => User, { foreignKey: 'senderId', as: 'sender' })
    sender!: User;
  
    @BelongsTo(() => User, { foreignKey: 'receiverId', as: 'receiver' })
    receiver!: User;

    @BelongsTo(() => Ad)
    ad!: Ad;

  
  }