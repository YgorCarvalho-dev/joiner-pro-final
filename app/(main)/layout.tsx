// app/(main)/layout.tsx

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LogoutButton } from '@/components/LogoutButton';



// Componente simples para a nossa Sidebar
const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Projetos', href: '/projetos' },
    { name: 'Clientes', href: '/clientes' },
    { name: 'Estoque & Insumos', href: '/estoque' },
    // { name: 'Produção (PCP)', href: '/producao' },
    { name: 'Financeiro', href: '/financeiro' },
    { name: 'Relatórios', href: '/relatorios' },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 h-full">

      <div className="text-xl font-bold mb-8 border-b border-gray-700 pb-4">
        {/* <Image
          src="/icons/2.ico   "
          alt="JoinerProimg"
          width={80}
          height={100}
        // className='mr-3'
        /> */}
        <span>Joiner PRO</span>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              {/* Usamos o componente Link do Next.js para navegação rápida */}
              <Link href={item.href} className="block p-2 rounded hover:bg-gray-700 transition duration-150">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <footer className="text-xs text-gray-500 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span>© {new Date().getFullYear()} Desenvolvido por <a href="https://www.instagram.com/compiler.tech" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors"><strong>@compiler.tech</strong></a></span>
          <LogoutButton />
        </div>
      </footer>
      
    </aside>
  );
};

// O componente Layout que engloba todas as páginas dentro de (main)
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Grid para a estrutura: 1 coluna para Sidebar (w-64) e o resto para o conteúdo
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Aqui serão renderizados os seus componentes de página, como o Dashboard, Projetos, etc. */}
        {children}
      </main>
    </div>
  );
}