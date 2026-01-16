import { Router } from 'express';
import OrderController from './controllers/OrderController';
import ProductController from './controllers/ProductController';

const router = Router();

router.get('/products', ProductController.index);
router.post('/orders', OrderController.create);

export default router;
