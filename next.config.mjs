/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilitar static optimization para páginas que usam dados dinâmicos
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  // Configuração para desenvolvimento
  ...(process.env.NODE_ENV === 'development' && {
    // Evitar problemas de static generation durante desenvolvimento
    output: undefined,
  }),
};

export default nextConfig;