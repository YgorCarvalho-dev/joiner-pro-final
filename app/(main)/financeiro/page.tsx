// app/(main)/financeiro/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, CheckCircle, AlertCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { MarcarPagoButton } from './components/MarcarPagoButton';
import { formatCurrency } from '@/lib/utils';
import { Modal } from '@/components/Modal'; // Importando seu Modal existente

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
  const res = await fetch('/api/contas-pagar', { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar contas a pagar');
  return res.json();
}

async function getContasReceber(): Promise<ContaReceber[]> {
  const res = await fetch('/api/contas-receber', { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar contas a receber');
  return res.json();
}

export default function FinanceiroPage() {
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Abre o modal e define qual item será excluído
  const openDeleteModal = (id: string, type: 'pagar' | 'receber') => {
    setItemToDelete({ id, type });
    setIsDeleteModalOpen(true);
  };

  // Função que executa a exclusão no banco
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
        const endpoint = itemToDelete.type === 'pagar' 
            ? `/api/contas-pagar/${itemToDelete.id}` 
            : `/api/contas-receber/${itemToDelete.id}`;

        const res = await fetch(endpoint, { method: 'DELETE' });

        if (!res.ok) throw new Error('Falha ao excluir item.');

        // Fecha modal e recarrega lista
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        await loadData();

    } catch (error) {
        alert('Erro ao excluir: ' + (error as Error).message);
    } finally {
        setIsDeleting(false);
    }
  };

  const totalPagar = contasPagar.reduce((sum, conta) => sum + conta.valor, 0);
  const totalReceber = contasReceber.reduce((sum, conta) => sum + conta.valor, 0);

  if (loading && contasPagar.length === 0 && contasReceber.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Add Conta a Pagar
          </Link>
          <Link
            href="/financeiro/contas-receber/novo"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Add Conta a Receber
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            Erro: {error}
        </div>
      )}

      {/* Resumos Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-red-500 w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-800">Contas a Pagar</h2>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPagar)}</p>
          <p className="text-sm text-gray-600">{contasPagar.length} lançamentos</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-green-500 w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-800">Contas a Receber</h2>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceber)}</p>
          <p className="text-sm text-gray-600">{contasReceber.length} lançamentos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- LISTA CONTAS A PAGAR --- */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">A Pagar</h3>
          <div className="space-y-3">
            {contasPagar.map((conta) => (
              <div key={conta.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100 transition">
                <div className="mb-2 sm:mb-0">
                  <p className="font-medium text-gray-800">{conta.descricao}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="flex items-center justify-end gap-3">
                  <div className="text-right mr-2">
                    <p className="font-bold text-gray-900">{formatCurrency(conta.valor)}</p>
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex items-center gap-1">
                    <MarcarPagoButton
                        contaId={conta.id}
                        tipo="pagar"
                        status={conta.status}
                        onSuccess={handleContaAtualizada}
                    />
                    
                    <Link 
                        href={`/financeiro/contas-pagar/${conta.id}`} // Link para edição
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                        title="Editar"
                    >
                        <Edit size={18} />
                    </Link>
                    
                    <button
                        onClick={() => openDeleteModal(conta.id, 'pagar')}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {contasPagar.length === 0 && <p className="text-gray-500 text-center py-8">Nenhuma conta pendente.</p>}
          </div>
        </div>

        {/* --- LISTA CONTAS A RECEBER --- */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">A Receber</h3>
          <div className="space-y-3">
            {contasReceber.map((conta) => (
              <div key={conta.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100 transition">
                <div className="mb-2 sm:mb-0">
                  <p className="font-medium text-gray-800">{conta.descricao}</p>
                  {conta.projeto && (
                    <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit mb-1">
                      PROJETO: {conta.projeto.nome}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="flex items-center justify-end gap-3">
                  <div className="text-right mr-2">
                    <p className="font-bold text-gray-900">{formatCurrency(conta.valor)}</p>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex items-center gap-1">
                    <MarcarPagoButton
                        contaId={conta.id}
                        tipo="receber"
                        status={conta.status}
                        onSuccess={handleContaAtualizada}
                    />

                    <Link 
                        href={`/financeiro/contas-receber/${conta.id}`} // Link para edição
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                        title="Editar"
                    >
                        <Edit size={18} />
                    </Link>
                    
                    <button
                        onClick={() => openDeleteModal(conta.id, 'receber')}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {contasReceber.length === 0 && <p className="text-gray-500 text-center py-8">Nenhuma conta prevista.</p>}
          </div>
        </div>
      </div>

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Lançamento Financeiro"
        confirmText={isDeleting ? "Excluindo..." : "Sim, Excluir"}
        cancelText="Cancelar"
      >
        <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
                <p className="text-gray-700">
                    Tem certeza que deseja excluir esta conta? 
                </p>
                <p className="text-red-600 font-bold mt-2 text-sm">
                    ATENÇÃO: Excluir é uma ação irreversível.
                </p>
            </div>
        </div>
      </Modal>

    </div>
  );
}