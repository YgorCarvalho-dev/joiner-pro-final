// app/(main)/relatorios/financeiro/page.tsx

import React from 'react';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { unstable_noStore } from 'next/cache';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

// Força a página a ser dinâmica para sempre buscar dados frescos do banco
export const dynamic = 'force-dynamic';

interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  status: string; // PENDENTE, PAGO, VENCIDO
}

interface ContaReceber {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  status: string; // PENDENTE, RECEBIDO, VENCIDO
  projeto?: {
    nome: string;
  };
}

// Funções de busca de dados
async function getContasPagar(): Promise<ContaPagar[]> {
  unstable_noStore(); // Garante que não use cache
  // Ajuste a URL se estiver rodando localmente sem ser no Vercel (ex: http://localhost:3000)
  // Em produção, NEXT_PUBLIC_BASE_URL deve estar configurado, ou use caminho relativo no server component se configurado
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const res = await fetch(`${baseUrl}/api/contas-pagar`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Falha ao buscar contas a pagar');
  return res.json();
}

async function getContasReceber(): Promise<ContaReceber[]> {
  unstable_noStore();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/contas-receber`, {
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
    // Busca dados em paralelo
    [contasPagar, contasReceber] = await Promise.all([
      getContasPagar(),
      getContasReceber(),
    ]);
  } catch (e) {
    error = (e as Error).message;
    console.error(e);
  }

  // --- LÓGICA DE CÁLCULO FINANCEIRO ---

  // 1. Totais Gerais (Lançamentos Totais - Regime de Competência)
  // Soma tudo, independente se pagou ou não, para saber o volume financeiro.
  const totalGeralPagar = contasPagar.reduce((sum, c) => sum + c.valor, 0);
  const totalGeralReceber = contasReceber.reduce((sum, c) => sum + c.valor, 0);

  // 2. Totais Realizados (Regime de Caixa)
  // Quanto dinheiro REALMENTE saiu ou entrou
  const totalPagoReal = contasPagar
    .filter(c => c.status === 'PAGO')
    .reduce((sum, c) => sum + c.valor, 0);

  const totalRecebidoReal = contasReceber
    .filter(c => c.status === 'RECEBIDO')
    .reduce((sum, c) => sum + c.valor, 0);

  // 3. Saldo Real (O que tem no bolso)
  const saldoReal = totalRecebidoReal - totalPagoReal;

  // 4. Contagem de Pendências (Para alerta)
  const pendentesPagar = contasPagar.filter(c => c.status === 'PENDENTE' || c.status === 'VENCIDO').length;
  const pendentesReceber = contasReceber.filter(c => c.status === 'PENDENTE' || c.status === 'VENCIDO').length;

  if (error) {
    return (
      <div className="p-6">
        <Link href="/relatorios" className="text-blue-500 hover:underline flex items-center gap-2 mb-4">
          <ArrowLeft size={16} />
          Voltar aos Relatórios
        </Link>
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          <p className="font-bold">Erro ao carregar relatório:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link href="/relatorios" className="text-blue-500 hover:underline flex items-center gap-2 mb-4">
        <ArrowLeft size={16} />
        Voltar aos Relatórios
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <DollarSign size={24} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Relatório Financeiro</h1>
        </div>
        
        <a
          href="/api/relatorios/financeiro/export"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-sm font-medium text-sm"
        >
          <Download size={16} />
          Exportar para Excel
        </a>
      </div>

      {/* --- CARDS DE RESUMO --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        
        {/* Card Vermelho: Total de Despesas Lançadas */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-2 -mt-2"></div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <TrendingDown className="text-red-500 w-5 h-5" />
            <span className="text-sm font-medium text-gray-600">Total Despesas</span>
          </div>
          <p className="text-2xl font-bold text-red-600 relative z-10">{formatCurrency(totalGeralPagar)}</p>
          <p className="text-xs text-gray-400 mt-1 relative z-10">
            Já pago: <span className="text-red-600 font-semibold">{formatCurrency(totalPagoReal)}</span>
          </p>
        </div>

        {/* Card Verde: Total de Receitas Lançadas */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-2 -mt-2"></div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <TrendingUp className="text-green-500 w-5 h-5" />
            <span className="text-sm font-medium text-gray-600">Total Receitas</span>
          </div>
          <p className="text-2xl font-bold text-green-600 relative z-10">{formatCurrency(totalGeralReceber)}</p>
          <p className="text-xs text-gray-400 mt-1 relative z-10">
            Já recebido: <span className="text-green-600 font-semibold">{formatCurrency(totalRecebidoReal)}</span>
          </p>
        </div>

        {/* Card Azul: SALDO REAL (Caixa) */}
        <div className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden`}>
           <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full -mr-2 -mt-2 ${saldoReal >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}></div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <DollarSign className={saldoReal >= 0 ? 'text-blue-500 w-5 h-5' : 'text-red-500 w-5 h-5'} />
            <span className="text-sm font-bold text-gray-700">Saldo em Caixa (Real)</span>
          </div>
          <p className={`text-2xl font-bold relative z-10 ${saldoReal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(saldoReal)}
          </p>
          <p className="text-xs text-gray-500 mt-1 relative z-10">Recebido - Pago</p>
        </div>

        {/* Card Amarelo: Pendências */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-50 rounded-bl-full -mr-2 -mt-2"></div>
          <p className="text-sm font-medium text-gray-600 relative z-10">Itens Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600 relative z-10">
            {pendentesPagar + pendentesReceber}
          </p>
          <p className="text-xs text-yellow-600 mt-1 relative z-10">Aguardando baixa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- TABELA CONTAS A PAGAR --- */}
        <div className="bg-white rounded-xl border shadow-sm flex flex-col h-full">
          <div className="p-4 border-b bg-gray-50 rounded-t-xl">
            <h3 className="text-lg font-semibold text-gray-700">Contas a Pagar</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {contasPagar.map((conta) => (
                  <tr key={conta.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-900">{conta.descricao}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(conta.valor)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        conta.status === 'PAGO' ? 'bg-green-100 text-green-800' : 
                        conta.status === 'VENCIDO' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
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
            <div className="p-8 text-center text-gray-400">
              Nenhuma conta a pagar encontrada.
            </div>
          )}
        </div>

        {/* --- TABELA CONTAS A RECEBER --- */}
        <div className="bg-white rounded-xl border shadow-sm flex flex-col h-full">
          <div className="p-4 border-b bg-gray-50 rounded-t-xl">
            <h3 className="text-lg font-semibold text-gray-700">Contas a Receber</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {contasReceber.map((conta) => (
                  <tr key={conta.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-900">{conta.descricao}</td>
                    <td className="px-4 py-3 text-sm text-blue-600 font-medium">{conta.projeto?.nome || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(conta.valor)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        conta.status === 'RECEBIDO' ? 'bg-green-100 text-green-800' : 
                        conta.status === 'VENCIDO' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
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
            <div className="p-8 text-center text-gray-400">
              Nenhuma conta a receber encontrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}