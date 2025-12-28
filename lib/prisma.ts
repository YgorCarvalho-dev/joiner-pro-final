// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Se não houver uma instância global (evita múltiplas instâncias em dev)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'], // Opcional: Para logar as queries SQL no console
});

// Se estiver em desenvolvimento e ainda não houver uma instância, 
// atribua a nova instância à variável global.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;