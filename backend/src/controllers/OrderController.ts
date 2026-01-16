import { Request, Response } from 'express';
import OrderService from '../services/OrderService';

class OrderController {
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const items = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'Invalid body. Expected array of { productId, quantity }.' });
        return;
      }

      const order = await OrderService.createOrder(items);
      res.status(201).json(order);
    } catch (error: any) {
      if (error.message === 'INSUFFICIENT_STOCK') {
        res.status(409).json({
          error: 'Stock validation failed',
          details: error.data
        });
      } else if (error.message.includes('Product with ID')) {
         res.status(422).json({ error: error.message });
      } else {
        console.error('Order Creation Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
}

export default new OrderController();
