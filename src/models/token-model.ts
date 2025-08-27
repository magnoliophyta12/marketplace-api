import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  CreatedAt,
  Default,
} from "sequelize-typescript";
import { User } from "./user-model.js";
import { v4 as uuidv4 } from "uuid";

@Table({
  tableName: "tokens",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
class Token extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: uuidv4(),
  }) 
  id!: string;
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;
 
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  token!: string;

  @Column({
    type: DataType.STRING,
  })
  type!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expireTime!: Date;

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
}

export default Token;
