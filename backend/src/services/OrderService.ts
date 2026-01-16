import sequelize from '../database/connection';
import { Order, Product, Input, ProductInput, OrderItem } from '../models';
import { Transaction } from 'sequelize';

interface OrderItemRequest {
  productId: number;
  quantity: number;
}

interface InsufficientStockError {
  message: string;
  details: {
    ingredient: string;
    required: number;
    available: number;
    affectedProducts: string[];
  };
}

class OrderService {
  public async createOrder(items: OrderItemRequest[]) {
    // 1. Start a managed transaction
    return await sequelize.transaction(async (t: Transaction) => {
      let totalPrice = 0;
      const inputsMap = new Map<number, { needed: number; inputName: string; affectedProducts: Set<string> }>();

      // 2. Process each item in the order
      for (const item of items) {
        const product = await Product.findByPk(item.productId, {
          include: [
            {
              model: Input,
              as: 'inputs',
              through: { attributes: ['quantity_needed'] }, // Get pivot data
            },
          ],
          transaction: t,
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }

        totalPrice += Number(product.price) * item.quantity;

        // 3. Aggregate input requirements
        // Cast to any because Sequelize associations can be tricky with Typescript types inferred automatically
        const productInputs = (product as any).inputs; 
        
        if (productInputs) {
          for (const input of productInputs) {
             const quantityNeededPerUnit = input.ProductInput.quantity_needed;
             const totalNeededForThisItem = quantityNeededPerUnit * item.quantity;

             if (!inputsMap.has(input.id)) {
               inputsMap.set(input.id, { 
                 needed: 0, 
                 inputName: input.name,
                 affectedProducts: new Set()
               });
             }
             
             const current = inputsMap.get(input.id)!;
             current.needed += totalNeededForThisItem;
             current.affectedProducts.add(product.name);
          }
        }
      }

      // 4. Validate and Update Stock
      for (const [inputId, requirement] of inputsMap.entries()) {
        // Lock the input row for update to prevent race conditions
        const inputEntity = await Input.findByPk(inputId, { 
          transaction: t,
          lock: true, 
          skipLocked: false 
        });

        if (!inputEntity) {
          throw new Error(`Ingredient with ID ${inputId} missing in database.`);
        }

        if (inputEntity.stock_quantity < requirement.needed) {
          const errorData: InsufficientStockError = {
            message: 'Insufficient stock',
            details: {
              ingredient: requirement.inputName,
              required: requirement.needed,
              available: inputEntity.stock_quantity,
              affectedProducts: Array.from(requirement.affectedProducts)
            }
          };
          // Throw a special error object (or stringified JSON) to be caught by controller
          const error = new Error('INSUFFICIENT_STOCK');
          (error as any).data = errorData;
          throw error;
        }

        // Decrement stock
        inputEntity.stock_quantity -= requirement.needed;
        await inputEntity.save({ transaction: t });
      }

      // 5. Create Order
      const order = await Order.create({
        total_price: totalPrice,
        status: 'completed' // Assuming instant completion if stock checks out, or 'pending'
      }, { transaction: t });

      // 6. Create Order Items
      const orderItemsData = await Promise.all(items.map(async (item) => {
        const product = await Product.findByPk(item.productId, { transaction: t });
        return {
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          price_at_purchase: product!.price
        };
      }));

      await OrderItem.bulkCreate(orderItemsData, { transaction: t });

      // Return the full order with items
      return await Order.findByPk(order.id, {
        include: [{ model: OrderItem, as: 'items' }],
        transaction: t
      });
    });
  }
}

export default new OrderService();
