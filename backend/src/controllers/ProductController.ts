import { Request, Response } from 'express';
import Product from '../models/Product';

class ProductController {
  public async index(req: Request, res: Response): Promise<void> {
    try {
      const products = await Product.findAll({
        order: [['name', 'ASC']],
      });
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new ProductController();
