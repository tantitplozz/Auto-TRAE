import jwt from 'jsonwebtoken';
import config from '../config';

export const generateToken = (payload: object): string => {
  const expiresIn = config.jwt.expiresIn || '1d';
  return jwt.sign(payload, config.jwt.secret, { expiresIn });
};

export const verifyToken = (token: string): string | object => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};