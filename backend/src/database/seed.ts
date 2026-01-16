import sequelize from './connection';
import { Input, Product, ProductInput, Order, OrderItem } from '../models';

const seed = async () => {
  try {
    await sequelize.authenticate();

    await sequelize.sync({ force: true }); 
    console.log('Database synced (cleared).');

    const inputs = await Input.bulkCreate([
      { name: 'Pão de Hambúrguer', stock_quantity: 50 },
      { name: 'Carne Bovina 150g', stock_quantity: 20 },
      { name: 'Queijo Cheddar', stock_quantity: 100 },
      { name: 'Bacon Fatiado', stock_quantity: 100 },
      { name: 'Alface Americana', stock_quantity: 40 },
      { name: 'Tomate', stock_quantity: 40 },
      { name: 'Maionese Especial', stock_quantity: 200 }
    ]);
    

    const i = (name: string) => inputs.find(inp => inp.name === name)!.id;

    const products = await Product.bulkCreate([
      { name: 'X-Burger', price: 15.00, category: 'Hambúrgueres', available: true },
      { name: 'X-Bacon', price: 18.00, category: 'Hambúrgueres', available: true },
      { name: 'X-Salada', price: 16.00, category: 'Hambúrgueres', available: true },
      { name: 'Coca-Cola 350ml', price: 5.00, category: 'Bebidas', available: true },
      { name: 'Água Mineral', price: 3.00, category: 'Bebidas', available: true },
    ]);

    const p = (name: string) => products.find(prod => prod.name === name)!.id;

    await ProductInput.bulkCreate([
      // X-Burger: Pão, Carne, Queijo
      { product_id: p('X-Burger'), input_id: i('Pão de Hambúrguer'), quantity_needed: 1 },
      { product_id: p('X-Burger'), input_id: i('Carne Bovina 150g'), quantity_needed: 1 },
      { product_id: p('X-Burger'), input_id: i('Queijo Cheddar'), quantity_needed: 2 }, // 2 fatias

      // X-Bacon: Pão, Carne, Queijo, Bacon
      { product_id: p('X-Bacon'), input_id: i('Pão de Hambúrguer'), quantity_needed: 1 },
      { product_id: p('X-Bacon'), input_id: i('Carne Bovina 150g'), quantity_needed: 1 },
      { product_id: p('X-Bacon'), input_id: i('Queijo Cheddar'), quantity_needed: 2 },
      { product_id: p('X-Bacon'), input_id: i('Bacon Fatiado'), quantity_needed: 3 },

      // X-Salada: Pão, Carne, Queijo, Alface, Tomate
      { product_id: p('X-Salada'), input_id: i('Pão de Hambúrguer'), quantity_needed: 1 },
      { product_id: p('X-Salada'), input_id: i('Carne Bovina 150g'), quantity_needed: 1 },
      { product_id: p('X-Salada'), input_id: i('Queijo Cheddar'), quantity_needed: 1 },
      { product_id: p('X-Salada'), input_id: i('Alface Americana'), quantity_needed: 1 },
      { product_id: p('X-Salada'), input_id: i('Tomate'), quantity_needed: 2 },
    ]);

    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
