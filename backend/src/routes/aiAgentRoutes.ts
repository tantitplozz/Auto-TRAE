import { Router } from 'express';
import * as aiAgentController from '../controllers/aiAgentController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', aiAgentController.createAgent);
router.get('/', aiAgentController.listAgents);
router.get('/:id', aiAgentController.getAgent);
router.put('/:id', aiAgentController.updateAgent);
router.delete('/:id', aiAgentController.deleteAgent);

export default router;