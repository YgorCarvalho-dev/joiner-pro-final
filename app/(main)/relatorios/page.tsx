// app/(main)/relatorios/page.tsx

import React from 'react';
import { FileText, Users, FolderOpen, Package, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function RelatoriosPage() {
  const relatorios = [
    {
      titulo: 'Relatório de Clientes',
      descricao: 'Lista completa de clientes com informações de contato e projetos associados.',
      icone: Users,
      href: '/relatorios/clientes',
    },
    {
      titulo: 'Relatório de Projetos',
      descricao: 'Visão geral de todos os projetos, status, valores e prazos.',
      icone: FolderOpen,
      href: '/relatorios/projetos',
    },
    {
      titulo: 'Relatório de Estoque',
      descricao: 'Inventário atual de insumos, quantidades disponíveis e categorias.',
      icone: Package,
      href: '/relatorios/estoque',
    },
    {
      titulo: 'Relatório Financeiro',
      descricao: 'Contas a pagar e receber, fluxo de caixa e lucros.',
      icone: DollarSign,
      href: '/relatorios/financeiro',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Relatórios</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatorios.map((relatorio) => {
          const Icone = relatorio.icone;
          return (
            <Link
              key={relatorio.href}
              href={relatorio.href}
              className="block p-6 bg-white rounded-lg border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <Icone size={24} className="text-blue-500" />
                <h3 className="text-lg font-semibold">{relatorio.titulo}</h3>
              </div>
              <p className="text-gray-600 text-sm">{relatorio.descricao}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Sobre os Relatórios</h2>
        <p className="text-gray-600">
          Os relatórios fornecem uma visão consolidada dos dados do sistema.
          Clique em qualquer relatório acima para visualizar ou exportar as informações.
          Funcionalidades avançadas de filtro e exportação estarão disponíveis em breve.
        </p>
      </div>
    </div>
  );
}