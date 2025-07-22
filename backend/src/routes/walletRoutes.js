// backend/routes/walletRoutes.js
import  express from 'express';
const router = express.Router();
import walletController from '../controllers/walletController.js';
import { requireAuth } from '../middleware/auth.js';

router.get('/wallet/balance', requireAuth, walletController.getWallet);
router.post('/wallet/incrementBalance', requireAuth, walletController.incrementBalance);
router.post('/wallet/decrementBalance', requireAuth, walletController.decrementBalance);

export default router;