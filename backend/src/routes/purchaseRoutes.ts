import { Router } from 'express';
import { makePurchaseController, getAgentStatusController } from '../controllers/purchaseController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Route to trigger a purchase for the authenticated user's agent
router.post('/purchase', protect, makePurchaseController);

// Route to get the current state of the authenticated user's agent
router.get('/status', protect, getAgentStatusController);

export default router;
