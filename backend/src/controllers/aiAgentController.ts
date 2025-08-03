import { Request, Response } from 'express';
import * as aiAgentService from '../services/aiAgentService';

export const createAgent = async (req: Request, res: Response) => {
  try {
    const agent = await aiAgentService.createAgent(req.body);
    res.status(201).json(agent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAgent = async (req: Request, res: Response) => {
  try {
    const agent = await aiAgentService.getAgentById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.status(200).json(agent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const listAgents = async (req: Request, res: Response) => {
  try {
    const agents = await aiAgentService.getAllAgents();
    res.status(200).json(agents);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAgent = async (req: Request, res: Response) => {
  try {
    const agent = await aiAgentService.updateAgent(req.params.id, req.body);
    res.status(200).json(agent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAgent = async (req: Request, res: Response) => {
  try {
    await aiAgentService.deleteAgent(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};