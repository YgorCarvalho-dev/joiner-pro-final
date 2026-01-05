// app/(main)/financeiro/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, DollarSign, Calendar, Edit, Trash2, Loader2, 
  ChevronLeft, ChevronRight, Wallet, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';
import { MarcarPagoButton } from './components/MarcarPagoButton';
import { formatCurrency } from '@/lib/utils';
import { Modal } from '@/components/Modal';

// --- Tipagens ---
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

// --- Funções de Busca ---
async function getContasPagar(): Promise<ContaPagar[]> {
  const res = await fetch('/api/contas-pagar', { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar contas a pagar');
  return res.json();
}

async function getContasReceber(): Promise<ContaReceber[]> {
  const res = await fetch('/api/contas-receber', { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar contas a receber');
  return res.json();
}

// --- Componente Principal ---
export default function FinanceiroPage() {
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Filtro de Data
  const [dataSelecionada, setDataSelecionada] = useState(new Date());

  // Estados para o Modal de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'pagar' | 'receber' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    loadData(); 
  };

  // --- Lógica de Datas ---
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrevMonth = () => {
    const novaData = new Date(dataSelecionada);
    novaData.setMonth(dataSelecionada.getMonth() - 1);
    setDataSelecionada(novaData);
  };

  const handleNextMonth = () => {
    const novaData = new Date(dataSelecionada);
    novaData.setMonth(dataSelecionada.getMonth() + 1);
    setDataSelecionada(novaData);
  };

  // --- Filtragem dos Dados pelo Mês Selecionado ---
  const filterByMonth = (dataString: string) => {
    const data = new Date(dataString);
    // Ajuste simples para garantir que compare ano e mês corretamente
    // (Considerando que a data vem em ISO UTC, pode precisar de ajuste de fuso dependendo da sua API,
    // mas para visualização simples isso geralmente funciona)
    return (
      data.getMonth() === dataSelecionada.getMonth() &&
      data.getFullYear() === dataSelecionada.getFullYear()
    );
  };

  const contasPagarFiltradas = contasPagar.filter(c => filterByMonth(c.dataVencimento));
  const contasReceberFiltradas = contasReceber.filter(c => filterByMonth(c.dataVencimento));

  // --- Cálculos ---
  const totalPagar = contasPagarFiltradas.reduce((sum, conta) => sum + conta.valor, 0);
  const totalReceber = contasReceberFiltradas.reduce((sum, conta) => sum + conta.valor, 0);
  const saldoPrevisto = totalReceber - totalPagar;

  // --- Lógica de Exclusão ---
  const openDeleteModal = (id: string, type: 'pagar' | 'receber') => {
    setItemToDelete({ id, type });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
        const endpoint = itemToDelete.type === 'pagar' 
            ? `/api/contas-pagar/${itemToDelete.id}` 
            : `/api/contas-receber/${itemToDelete.id}`;
        const res = await fetch(endpoint, { method: 'DELETE' });
        if (!res.ok) throw new Error('Falha ao excluir item.');
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        await loadData();
    } catch (error) {
        alert('Erro ao excluir: ' + (error as Error).message);
    } finally {
        setIsDeleting(false);
    }
  };

  if (loading && contasPagar.length === 0 && contasReceber.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* --- CABEÇALHO E NAVEGAÇÃO DE DATA --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
        
        {/* Navegador de Meses (Estilo App de Banco) */}
        <div className="flex items-center bg-white rounded-full shadow-sm border px-2 py-1">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <ChevronLeft size={20} />
          </button>
          <div className="px-4 text-center min-w-[140px]">
            <span className="block text-xs text-gray-400 font-semibold uppercase">{dataSelecionada.getFullYear()}</span>
            <span className="block text-lg font-bold text-gray-800 capitalize">
              {meses[dataSelecionada.getMonth()]}
            </span>
          </div>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex gap-2">
          <Link href="/financeiro/contas-pagar/novo" className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition">
            <Plus size={16} />
            <span className="hidden sm:inline">Despesa</span>
          </Link>
          <Link href="/financeiro/contas-receber/novo" className="bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm font-medium transition">
            <Plus size={16} />
            <span className="hidden sm:inline">Receita</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm border border-red-200">
            Erro: {error}
        </div>
      )}

      {/* --- CARDS DE RESUMO DO MÊS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Card Despesas */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
             <DollarSign className="w-16 h-16 text-red-500" />
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">A Pagar</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPagar)}</p>
          <p className="text-xs text-red-600 mt-2 bg-red-50 w-fit px-2 py-1 rounded-full font-medium">
             {contasPagarFiltradas.length} lançamentos
          </p>
        </div>

        {/* Card Receitas */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
             <DollarSign className="w-16 h-16 text-green-500" />
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">A Receber</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalReceber)}</p>
          <p className="text-xs text-green-600 mt-2 bg-green-50 w-fit px-2 py-1 rounded-full font-medium">
             {contasReceberFiltradas.length} lançamentos
          </p>
        </div>


        {/* Card Saldo (Balanço) */}
        <div className={`p-5 rounded-xl border shadow-sm relative overflow-hidden ${saldoPrevisto >= 0 ? 'bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500' : 'bg-gradient-to-br from-red-600 to-red-800 border-red-500'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-20">
             <Wallet className="w-16 h-16 text-white" />
          </div>
          <p className="text-sm text-blue-100 font-medium mb-1">Saldo Previsto do Mês</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(saldoPrevisto)}</p>
          <p className="text-xs text-white/80 mt-2">
             {saldoPrevisto >= 0 ? 'Caixa positivo' : 'Atenção: Despesas superam receitas'}
          </p>
        </div>
      </div>

      {/* --- LISTAGEM DE LANÇAMENTOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUNA A PAGAR */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
             <h3 className="font-semibold text-gray-700">Contas a Pagar</h3>
             <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">SAÍDAS</span>
          </div>
          <div className="divide-y divide-gray-100">
            {contasPagarFiltradas.length > 0 ? (
                contasPagarFiltradas.map((conta) => (
                <div key={conta.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center group">
                    <div>
                        <p className="font-medium text-gray-900">{conta.descricao}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={14} />
                            {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-gray-900 mb-1">{formatCurrency(conta.valor)}</p>
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <MarcarPagoButton contaId={conta.id} tipo="pagar" status={conta.status} onSuccess={handleContaAtualizada}/>
                            <Link href={`/financeiro/contas-pagar/${conta.id}`} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded">
                                <Edit size={16} />
                            </Link>
                            <button onClick={() => openDeleteModal(conta.id, 'pagar')} className="p-1.5 text-red-600 hover:bg-red-100 rounded">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
                ))
            ) : (
                <div className="p-8 text-center text-gray-400">
                    <p className="text-sm">Nenhuma conta para este mês.</p>
                </div>
            )}
          </div>
        </div>

        {/* COLUNA A RECEBER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
             <h3 className="font-semibold text-gray-700">Contas a Receber</h3>
             <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">ENTRADAS</span>
          </div>
          <div className="divide-y divide-gray-100">
            {contasReceberFiltradas.length > 0 ? (
                contasReceberFiltradas.map((conta) => (
                <div key={conta.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center group">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{conta.descricao}</p>
                            {conta.projeto && (
                                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                {conta.projeto.nome}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={14} />
                            {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-green-600 mb-1">+ {formatCurrency(conta.valor)}</p>
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <MarcarPagoButton contaId={conta.id} tipo="receber" status={conta.status} onSuccess={handleContaAtualizada}/>
                            <Link href={`/financeiro/contas-receber/${conta.id}`} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded">
                                <Edit size={16} />
                            </Link>
                            <button onClick={() => openDeleteModal(conta.id, 'receber')} className="p-1.5 text-red-600 hover:bg-red-100 rounded">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
                ))
            ) : (
                <div className="p-8 text-center text-gray-400">
                    <p className="text-sm">Nenhuma receita para este mês.</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Lançamento"
        confirmText={isDeleting ? "Excluindo..." : "Sim, Excluir"}
        cancelText="Cancelar"
      >
        <div className="flex items-start gap-3">
            <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
                <p className="text-gray-900 font-medium">Tem certeza?</p>
                <p className="text-gray-500 text-sm mt-1">
                    Essa ação removerá o lançamento financeiro permanentemente do sistema.
                </p>
            </div>
        </div>
      </Modal>

    </div>
  );
}