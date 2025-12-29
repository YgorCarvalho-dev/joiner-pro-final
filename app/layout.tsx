// app/layout.tsx

import './globals.css'; // <--- Não esqueça de importar o seu CSS global aqui!
import type { Metadata } from 'next'; // Importa a tipagem do Next.js para metadados
import { Inter } from 'next/font/google'; // Exemplo de importação de fonte
import { Providers } from '@/components/providers';

// Configuração da Fonte (Exemplo)
const inter = Inter({ subsets: ['latin'] });

// 1. METADADOS (Importante para SEO)
export const metadata: Metadata = {
    title: 'Joiner PRO',
    description: 'Sistema de Planejamento de Recursos Empresariais (ERP) focado em Marcenarias e Indústrias Moveleiras.',
};

// 2. COMPONENTE RAIZ DO LAYOUT
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // Define o idioma e importa as classes de fontes no HTML
        <html lang="pt-BR">
            {/* A tag <body> aplica a fonte e garante que o corpo do documento seja renderizado.
        As classes do Tailwind (como 'antialiased') podem ser aplicadas aqui.
      */}
            <body className={inter.className + ' antialiased'}>
                <Providers>
                    {/* 'children' representa todo o conteúdo das rotas aninhadas
          (incluindo o seu MainLayout dentro de (main)).
        */}
                    {children}
                </Providers>

                <div id="modal-root" />
            </body>
        </html>
    );
}