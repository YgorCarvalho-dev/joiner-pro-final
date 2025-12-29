// app/(main)/financeiro/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Componente Client para os botões de marcar como pago
import { MarcarPagoButton } from './components/MarcarPagoButton';
import { formatCurrency } from '@/lib/utils';

// Tipagens
interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: string;
}

interface ContaReceber {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: string;
  projeto?: {
    id: string;
    nome: string;
  };
}

// Funções para buscar dados
async function getContasPagar(): Promise<ContaPagar[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contas-pagar`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Falha ao buscar contas a pagar');
  return res.json();
}

async function getContasReceber(): Promise<ContaReceber[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contas-receber`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Falha ao buscar contas a receber');
  return res.json();
}

export default function FinanceiroPage() {
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pagar, receber] = await Promise.all([
        getContasPagar(),
        getContasReceber(),
      ]);
      setContasPagar(pagar);
      setContasReceber(receber);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleContaAtualizada = () => {
    loadData(); // Recarrega os dados após marcar uma conta como paga
  };

  const totalPagar = contasPagar.reduce((sum, conta) => sum + conta.valor, 0);
  const totalReceber = contasReceber.reduce((sum, conta) => sum + conta.valor, 0);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Financeiro</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Financeiro</h1>
        <p className="text-red-500">Erro: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <div className="flex gap-2">
          <Link
            href="/financeiro/contas-pagar/novo"
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-2"
          >
            <Plus size={16} />
            Nova Conta a Pagar
          </Link>
          <Link
            href="/financeiro/contas-receber/novo"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
          >
            <Plus size={16} />
            Nova Conta a Receber
          </Link>
        </div>
      </div>

      {/* Resumos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-red-500" />
            <h2 className="text-lg font-semibold">Contas a Pagar</h2>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPagar)}</p>
          <p className="text-sm text-gray-600">{contasPagar.length} contas</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-green-500" />
            <h2 className="text-lg font-semibold">Contas a Receber</h2>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceber)}</p>
          <p className="text-sm text-gray-600">{contasReceber.length} contas</p>
        </div>
      </div>

      {/* Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas a Pagar */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Contas a Pagar</h3>
          <div className="space-y-2">
            {contasPagar.map((conta) => (
              <div key={conta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{conta.descricao}</p>
                  <p className="text-sm text-gray-600">
                    Vence em: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right flex items-center justify-end gap-2">
                  <p className="font-bold">{formatCurrency(conta.valor)}</p>
                  <MarcarPagoButton
                    contaId={conta.id}
                    tipo="pagar"
                    status={conta.status}
                    onSuccess={handleContaAtualizada}
                  />
                </div>
              </div>
            ))}
            {contasPagar.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma conta a pagar cadastrada.</p>
            )}
          </div>
        </div>

        {/* Contas a Receber */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Contas a Receber</h3>
          <div className="space-y-2">
            {contasReceber.map((conta) => (
              <div key={conta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{conta.descricao}</p>
                  {conta.projeto && (
                    <p className="text-sm text-blue-600">Projeto: {conta.projeto.nome}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Vence em: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right flex items-center justify-end gap-2">
                  <p className="font-bold">{formatCurrency(conta.valor)}</p>
                  <MarcarPagoButton
                    contaId={conta.id}
                    tipo="receber"
                    status={conta.status}
                    onSuccess={handleContaAtualizada}
                  />
                </div>
              </div>
            ))}
            {contasReceber.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma conta a receber cadastrada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}