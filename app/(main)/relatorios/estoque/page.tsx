// app/(main)/relatorios/estoque/page.tsx

import React from 'react';
import { ArrowLeft, Package, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { unstable_noStore } from 'next/cache';
import Link from 'next/link';import { formatCurrency } from '@/lib/utils';
export const dynamic = 'force-dynamic';

interface Insumo {
  id: string;
  nome: string;
  descricao: string | null;
  unidadeMedida: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  precoCusto: number;
  categoria: {
    nome: string;
  };
}

async function getInsumos(): Promise<Insumo[]> {
  unstable_noStore();
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/estoque`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Falha ao buscar insumos');
  return res.json();
}

export default async function RelatorioEstoquePage() {
  let insumos: Insumo[] = [];
  let error: string | null = null;

  try {
    insumos = await getInsumos();
  } catch (e) {
    error = (e as Error).message;
    console.error(e);
  }

  const totalInsumos = insumos.length;
  const insumosBaixoEstoque = insumos.filter(i => i.estoqueAtual <= i.estoqueMinimo).length;
  const valorTotalEstoque = insumos.reduce((sum, i) => sum + (i.estoqueAtual * i.precoCusto), 0);

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
        <Package size={24} className="text-blue-500" />
        <h1 className="text-2xl font-bold">Relatório de Estoque</h1>
        <a
          href="/api/relatorios/estoque/export"
          className="ml-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
        >
          <Download size={16} />
          Exportar Excel
        </a>
      </div>

      {/* Resumos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total de Insumos</p>
          <p className="text-2xl font-bold text-blue-600">{totalInsumos}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Baixo Estoque</p>
          <p className="text-2xl font-bold text-red-600">{insumosBaixoEstoque}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Valor Total em Estoque</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(valorTotalEstoque)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Categoria</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estoque Atual</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estoque Mínimo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Preço Custo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {insumos.map((insumo) => (
                <tr key={insumo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{insumo.nome}</td>
                  <td className="px-4 py-3 text-sm">{insumo.categoria.nome}</td>
                  <td className="px-4 py-3 text-sm">{insumo.estoqueAtual} {insumo.unidadeMedida}</td>
                  <td className="px-4 py-3 text-sm">{insumo.estoqueMinimo} {insumo.unidadeMedida}</td>
                  <td className="px-4 py-3 text-sm">{formatCurrency(insumo.precoCusto)}</td>
                  <td className="px-4 py-3 text-sm">
                    {insumo.estoqueAtual <= insumo.estoqueMinimo ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle size={14} />
                        <span className="text-xs">Baixo</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={14} />
                        <span className="text-xs">OK</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {insumos.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Nenhum insumo cadastrado.
          </div>
        )}
      </div>
    </div>
  );
}