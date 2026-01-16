import Input from './Input';
import Product from './Product';
import ProductInput from './ProductInput';
import Order from './Order';
import OrderItem from './OrderItem';


Product.belongsToMany(Input, {
  through: ProductInput,
  foreignKey: 'product_id',
  otherKey: 'input_id',
  as: 'inputs'
});

Input.belongsToMany(Product, {
  through: ProductInput,
  foreignKey: 'input_id',
  otherKey: 'product_id',
  as: 'products'
});


Product.hasMany(ProductInput, { foreignKey: 'product_id' });
ProductInput.belongsTo(Product, { foreignKey: 'product_id' });
Input.hasMany(ProductInput, { foreignKey: 'input_id' });
ProductInput.belongsTo(Input, { foreignKey: 'input_id' });


Order.belongsToMany(Product, {
  through: OrderItem,
  foreignKey: 'order_id',
  otherKey: 'product_id',
  as: 'products'
});

Product.belongsToMany(Order, {
  through: OrderItem,
  foreignKey: 'product_id',
  otherKey: 'order_id',
  as: 'orders'
});

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

export {
  Input,
  Product,
  ProductInput,
  Order,
  OrderItem
};
