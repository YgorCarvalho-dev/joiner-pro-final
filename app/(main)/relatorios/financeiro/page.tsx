// app/(main)/relatorios/financeiro/page.tsx

import React from 'react';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { unstable_noStore } from 'next/cache';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';


interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  status: string;
}

interface ContaReceber {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  status: string;
  projeto?: {
    nome: string;
  };
}

async function getContasPagar(): Promise<ContaPagar[]> {
  unstable_noStore();
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contas-pagar`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Falha ao buscar contas a pagar');
  return res.json();
}

async function getContasReceber(): Promise<ContaReceber[]> {
  unstable_noStore();
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contas-receber`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Falha ao buscar contas a receber');
  return res.json();
}

export default async function RelatorioFinanceiroPage() {
  let contasPagar: ContaPagar[] = [];
  let contasReceber: ContaReceber[] = [];
  let error: string | null = null;

  try {
    [contasPagar, contasReceber] = await Promise.all([
      getContasPagar(),
      getContasReceber(),
    ]);
  } catch (e) {
    error = (e as Error).message;
    console.error(e);
  }

  const totalPagar = contasPagar.reduce((sum, c) => sum + c.valor, 0);
  const totalReceber = contasReceber.reduce((sum, c) => sum + c.valor, 0);
  const saldo = totalReceber - totalPagar;

  const contasPagarPendentes = contasPagar.filter(c => c.status === 'PENDENTE');
  const contasReceberPendentes = contasReceber.filter(c => c.status === 'PENDENTE');

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
        <DollarSign size={24} className="text-blue-500" />
        <h1 className="text-2xl font-bold">Relatório Financeiro</h1>
        <a
          href="/api/relatorios/financeiro/export"
          className="ml-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
        >
          <Download size={16} />
          Exportar Excel
        </a>
      </div>

      {/* Resumos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="text-red-500" />
            <span className="text-sm font-medium">Total a Pagar</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPagar)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-500" />
            <span className="text-sm font-medium">Total a Receber</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceber)}</p>
        </div>
        <div className={`p-4 rounded-lg border ${saldo >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className={saldo >= 0 ? 'text-blue-500' : 'text-red-500'} />
            <span className="text-sm font-medium">Saldo</span>
          </div>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(saldo)}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Contas Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600">
            {contasPagarPendentes.length + contasReceberPendentes.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas a Pagar */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Contas a Pagar</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Descrição</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Valor</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Vencimento</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contasPagar.map((conta) => (
                  <tr key={conta.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{conta.descricao}</td>
                    <td className="px-4 py-2 text-sm">{formatCurrency(conta.valor)}</td>
                    <td className="px-4 py-2 text-sm">
                      {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        conta.status === 'PAGO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {conta.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {contasPagar.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              Nenhuma conta a pagar cadastrada.
            </div>
          )}
        </div>

        {/* Contas a Receber */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Contas a Receber</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Descrição</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Projeto</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Valor</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Vencimento</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contasReceber.map((conta) => (
                  <tr key={conta.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{conta.descricao}</td>
                    <td className="px-4 py-2 text-sm">{conta.projeto?.nome || '-'}</td>
                    <td className="px-4 py-2 text-sm">{formatCurrency(conta.valor)}</td>
                    <td className="px-4 py-2 text-sm">
                      {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        conta.status === 'RECEBIDO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {conta.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {contasReceber.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              Nenhuma conta a receber cadastrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}