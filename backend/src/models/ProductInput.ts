import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/connection';

class ProductInput extends Model {
  public product_id!: number;
  public input_id!: number;
  public quantity_needed!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ProductInput.init(
  {
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    input_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'inputs',
        key: 'id',
      },
    },
    quantity_needed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'product_inputs',
  }
);

export default ProductInput;
