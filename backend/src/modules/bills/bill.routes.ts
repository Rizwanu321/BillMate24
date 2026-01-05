import { Router } from 'express';
import { billController } from './bill.controller';
import { authenticate, requireShopkeeper, requireBilling } from '../../middlewares';

const router = Router();

router.use(authenticate, requireShopkeeper, requireBilling);

router.post('/', billController.create.bind(billController));
router.get('/', billController.getAll.bind(billController));
router.get('/recent', billController.getRecent.bind(billController));
router.get('/stats', billController.getStats.bind(billController));
router.get('/:id', billController.getById.bind(billController));

export const billRoutes = router;
