'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/Modal';

// Tipagem simples de projeto
interface Projeto {
    id: string;
    nome: string;
}

export default function EditarContaReceberPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Listas auxiliares
  const [projetos, setProjetos] = useState<Projeto[]>([]);

  // Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    dataVencimento: '',
    status: 'PENDENTE',
    projetoId: '' // Campo extra para contas a receber
  });

  // Busca Dados da Conta + Lista de Projetos
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
        try {
            // 1. Busca Projetos (para preencher o select)
            const resProjetos = await fetch('/api/projetos');
            if (resProjetos.ok) {
                setProjetos(await resProjetos.json());
            }

            // 2. Busca a Conta
            const resConta = await fetch(`/api/contas-receber/${id}`);
            if (resConta.status === 404) notFound();
            if (!resConta.ok) throw new Error('Erro ao buscar conta');
            const data = await resConta.json();

            const dataFormatada = data.dataVencimento 
                ? new Date(data.dataVencimento).toISOString().split('T')[0] 
                : '';

            setFormData({
                descricao: data.descricao,
                valor: data.valor.toString(),
                dataVencimento: dataFormatada,
                status: data.status,
                projetoId: data.projetoId || '' // Se tiver projeto vinculado
            });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
          ...formData,
          valor: parseFloat(formData.valor),
          dataVencimento: new Date(formData.dataVencimento).toISOString(),
          // Se projetoId for vazio, mandamos null pro banco
          projetoId: formData.projetoId === '' ? null : formData.projetoId
      };

      const res = await fetch(`/api/contas-receber/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Erro ao atualizar conta');
      
      router.push('/financeiro'); 
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/contas-receber/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      router.push('/financeiro');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin w-8 h-8 mx-auto text-green-600"/></div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Editar Conta a Receber</h1>
        <Link href="/financeiro" className="text-blue-600 hover:underline flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <input
            type="text"
            required
            value={formData.descricao}
            onChange={e => setFormData({...formData, descricao: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Select de Projeto (Opcional) */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Vincular a Projeto (Opcional)</label>
            <select
                value={formData.projetoId}
                onChange={e => setFormData({...formData, projetoId: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
            >
                <option value="">-- Sem Projeto --</option>
                {projetos.map(proj => (
                    <option key={proj.id} value={proj.id}>{proj.nome}</option>
                ))}
            </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.valor}
              onChange={e => setFormData({...formData, valor: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vencimento</label>
            <input
              type="date"
              required
              value={formData.dataVencimento}
              onChange={e => setFormData({...formData, dataVencimento: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
            >
                <option value="PENDENTE">Pendente</option>
                <option value="RECEBIDO">Recebido</option>
                <option value="VENCIDO">Vencido</option>
            </select>
        </div>

        <div className="flex justify-between items-center pt-4 border-t mt-4">
           <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-5 h-5 mr-1" /> Excluir Conta
          </button>

          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 flex items-center disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2" />}
            Salvar Alterações
          </button>
        </div>
      </form>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Conta a Receber"
        confirmText={deleting ? "Excluindo..." : "Sim, Excluir"}
      >
        <div className="flex items-center gap-3">
             <AlertTriangle className="text-red-500 w-6 h-6" />
             <p>Tem certeza? Essa ação é irreversível.</p>
        </div>
      </Modal>
    </div>
  );
}