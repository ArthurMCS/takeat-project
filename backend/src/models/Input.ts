import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/connection';

class Input extends Model {
  public id!: number;
  public name!: string;
  public stock_quantity!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Input.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'inputs',
  }
);

export default Input;
