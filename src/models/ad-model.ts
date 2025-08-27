import { Category } from "./category-model.js";
import { User } from "./user-model.js";
import { Photo } from "./photo-model.js";
import {
  Model,
  Table,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
  HasMany,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
import { Message } from "./message-model.js";

@Table({
  tableName: "ads",
  timestamps: false,
  scopes: {
    lowPrice: {
      where: {
        price: {
          [Op.lte]: 10000,
        },
        isActive: true,
      },
    },
    available: {
      where: { isActive: true },
    },
  },
})
export class Ad extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: uuidv4(),
  })
  id!: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isActive!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  categoryId!: string;

  @BelongsTo(() => Category)
  category!: Category;

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => Photo)
  photos!: Photo[];

  @HasMany(() => Message)
  messages!: Message[];
}
