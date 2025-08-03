// d:\Trae\backend\src\models\Agent.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const Agent = prisma.agent;
