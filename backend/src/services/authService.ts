import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient, User } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import config from '../config';

const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);

export const register = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ user: Omit<User, 'password'>, token: string }> => {
    const existingUser = await userRepository.findUserByEmail(userData.email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await userRepository.createUser({
        ...userData,
        password: hashedPassword,
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, config.jwt.secret, { expiresIn: config.jwt.expiresIn || '1h' });
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
};

export const login = async (email: string, pass: string): Promise<{ user: Omit<User, 'password'>, token: string } | null> => {
    const user = await userRepository.findUserByEmail(email);
    if (!user || !await bcrypt.compare(pass, user.password)) {
        return null;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, config.jwt.secret, { expiresIn: config.jwt.expiresIn || '1h' });
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
};
