// d:\Trae\backend\src\models\Purchase.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const Purchase = prisma.purchase;
