import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.register({ email, password });
    res.status(201).json({ message: 'User registered successfully', user, token });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const loginController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        if (!result) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.status(200).json({ message: 'Login successful', ...result });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
