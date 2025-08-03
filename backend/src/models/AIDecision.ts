// d:\Trae\backend\src\models\AIDecision.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const AIDecision = prisma.aIDecision;
