// app/(main)/page.tsx

import React from 'react';
import Link from 'next/link';
import { unstable_noStore } from 'next/cache';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

// Funções para buscar dados do dashboard
async function getProjetosAtivos(): Promise<number> {
  unstable_noStore();
  try {
    const count = await prisma.projeto.count({
      where: {
        status: {
          notIn: ['CONCLUIDO', 'CANCELADO'], // Projetos não finalizados ou cancelados
        },
      },
    });
    return count;
  } catch (error) {
    console.error('Erro ao buscar projetos ativos:', error);
    return 0;
  }
}

async function getEstoqueCritico(): Promise<number> {
  unstable_noStore();
  try {
    const count = await prisma.insumo.count({
      where: {
        estoqueAtual: {
          lte: prisma.insumo.fields.estoqueMinimo,
        },
      },
    });
    return count;
  } catch (error) {
    console.error('Erro ao buscar estoque crítico:', error);
    return 0;
  }
}

async function getContasPagarProximos7Dias(): Promise<number> {
  unstable_noStore();
  try {
    const hoje = new Date();
    const inicioDia = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate())); // Início do dia atual em UTC
    const daqui7Dias = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() + 7)); // Fim do 7º dia em UTC

    const contas = await prisma.contaPagar.findMany({
      where: {
        dataVencimento: {
          gte: inicioDia,
          lte: daqui7Dias,
        },
        status: 'PENDENTE',
      },
      select: { valor: true },
    });

    const total = contas.reduce((sum, conta) => sum + conta.valor, 0);
    return total;
  } catch (error) {
    console.error('Erro ao buscar contas a pagar:', error);
    return 0;
  }
}

async function getTotalClientes(): Promise<number> {
  unstable_noStore();
  try {
    const count = await prisma.cliente.count();
    return count;
  } catch (error) {
    console.error('Erro ao buscar total de clientes:', error);
    return 0;
  }
}

async function getReceitaMes(): Promise<number> {
  unstable_noStore();
  try {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const contas = await prisma.contaReceber.findMany({
      where: {
        dataPagamento: {
          gte: inicioMes,
          lte: fimMes,
        },
        status: 'RECEBIDO',
      },
      select: { valor: true },
    });

    const total = contas.reduce((sum, conta) => sum + conta.valor, 0);
    return total;
  } catch (error) {
    console.error('Erro ao buscar receita do mês:', error);
    return 0;
  }
}

export default async function DashboardPage() {
  // Buscar dados
  const [projetosAtivos, estoqueCritico, contasPagar7Dias, totalClientes, receitaMes] = await Promise.all([
    getProjetosAtivos(),
    getEstoqueCritico(),
    getContasPagarProximos7Dias(),
    getTotalClientes(),
    getReceitaMes(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Dashboard
      </h1>
      <p className="text-gray-600 mb-8">
        Visão geral e indicadores chave da sua produção e finanças.
      </p>

      {/* Cards do Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/projetos" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Projetos Ativos</h2>
            <p className="text-4xl font-extrabold text-blue-600">{projetosAtivos}</p>
            <p className="text-sm text-gray-500 mt-1">Em andamento</p>
          </div>
        </Link>

        <Link href="/estoque" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Estoque Crítico</h2>
            <p className="text-4xl font-extrabold text-green-600">{estoqueCritico}</p>
            <p className="text-sm text-gray-500 mt-1">Itens abaixo do mínimo</p>
          </div>
        </Link>

        <Link href="/financeiro" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Contas a Pagar (7 dias)</h2>
            <p className="text-4xl font-extrabold text-red-600">{formatCurrency(contasPagar7Dias)}</p>
            <p className="text-sm text-gray-500 mt-1">Vencendo em breve</p>
          </div>
        </Link>

        <Link href="/clientes" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total de Clientes</h2>
            <p className="text-4xl font-extrabold text-purple-600">{totalClientes}</p>
            <p className="text-sm text-gray-500 mt-1">Cadastrados</p>
          </div>
        </Link>

        <Link href="/relatorios/financeiro" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Receita do Mês</h2>
            <p className="text-4xl font-extrabold text-yellow-600">{formatCurrency(receitaMes)}</p>
            <p className="text-sm text-gray-500 mt-1">Recebida este mês</p>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Status Geral</h2>
          <p className="text-lg font-semibold text-indigo-600">
            {projetosAtivos > 0 ? 'Produção Ativa' : 'Sem Atividades'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {estoqueCritico > 0 ? `${estoqueCritico} itens críticos` : 'Estoque OK'}
          </p>
        </div>
      </div>
    </div>
  );
}