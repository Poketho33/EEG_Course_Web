import { PrismaClient } from './generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.poolQueryViaFetch = true;

declare global {
  var prisma: PrismaClient | undefined
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });

export const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;