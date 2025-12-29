// app/(main)/relatorios/projetos/page.tsx

import React from 'react';
import { ArrowLeft, FolderOpen, Calendar, DollarSign, Download } from 'lucide-react';
import { unstable_noStore } from 'next/cache';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface Projeto {
  id: string;
  nome: string;
  descricao: string | null;
  valorTotal: number;
  status: string;
  prazoEmDias: number;
  dataInicioProducao: string | null;
  criadoEm: string;
  cliente: {
    nome: string;
  };
}

async function getProjetos(): Promise<Projeto[]> {
  unstable_noStore();
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/projetos`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Falha ao buscar projetos');
  return res.json();
}

export default async function RelatorioProjetosPage() {
  let projetos: Projeto[] = [];
  let error: string | null = null;

  try {
    projetos = await getProjetos();
  } catch (e) {
    error = (e as Error).message;
    console.error(e);
  }

  const totalValor = projetos.reduce((sum, p) => sum + p.valorTotal, 0);
  const projetosAtivos = projetos.filter(p => p.status !== 'FINALIZADO').length;

  if (error) {
    return (
      <div className="p-6">
        <Link href="/relatorios" className="text-blue-500 hover:underline flex items-center gap-2 mb-4">
          <ArrowLeft size={16} />
          Voltar aos Relatórios
        </Link>
        <p className="text-red-500">Erro: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link href="/relatorios" className="text-blue-500 hover:underline flex items-center gap-2 mb-4">
        <ArrowLeft size={16} />
        Voltar aos Relatórios
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <FolderOpen size={24} className="text-blue-500" />
        <h1 className="text-2xl font-bold">Relatório de Projetos</h1>
        <a
          href="/api/relatorios/projetos/export"
          className="ml-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
        >
          <Download size={16} />
          Exportar Excel
        </a>
      </div>

      {/* Resumos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total de Projetos</p>
          <p className="text-2xl font-bold text-blue-600">{projetos.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Projetos Ativos</p>
          <p className="text-2xl font-bold text-green-600">{projetosAtivos}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Valor Total</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalValor)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Prazo (dias)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projetos.map((projeto) => (
                <tr key={projeto.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{projeto.nome}</td>
                  <td className="px-4 py-3 text-sm">{projeto.cliente.nome}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-gray-400" />
                      {formatCurrency(projeto.valorTotal)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      projeto.status === 'FINALIZADO' ? 'bg-green-100 text-green-800' :
                      projeto.status === 'EM_PRODUCAO' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {projeto.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {projeto.prazoEmDias}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(projeto.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {projetos.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Nenhum projeto cadastrado.
          </div>
        )}
      </div>
    </div>
  );
}