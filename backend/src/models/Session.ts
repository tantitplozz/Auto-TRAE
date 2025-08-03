// d:\Trae\backend\src\models\Session.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const Session = prisma.session;
