import { Request, Response } from 'express';
import { makePurchase } from '../services/purchaseService';
import { getAgentById, getAgentByUserId } from '../services/aiAgentService';

interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export const makePurchaseController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const agent = await getAgentByUserId(userId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found for this user' });
    }

    const { productUrl } = req.body;
    if (!productUrl) {
      return res.status(400).json({ message: 'productUrl is required' });
    }

    const result = await makePurchase(agent.id, productUrl);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Purchase failed', error: error.message });
  }
};

export const getAgentStatusController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const agent = await getAgentByUserId(userId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found for this user' });
    }

    res.status(200).json({ agentId: agent.id, state: agent.state });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to get agent status', error: error.message });
  }
};
