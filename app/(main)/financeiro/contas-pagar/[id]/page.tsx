'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/Modal';

export default function EditarContaPagarPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    dataVencimento: '',
    status: 'PENDENTE' // ou PAGO
  });

  // Busca os dados ao carregar
  useEffect(() => {
    if (!id) return;

    fetch(`/api/contas-pagar/${id}`)
      .then(async (res) => {
        if (res.status === 404) notFound();
        if (!res.ok) throw new Error('Erro ao buscar conta');
        const data = await res.json();
        
        // Formata a data para o input HTML (yyyy-MM-dd)
        const dataVencimentoFormatada = data.dataVencimento 
          ? new Date(data.dataVencimento).toISOString().split('T')[0] 
          : '';

        setFormData({
          descricao: data.descricao,
          valor: data.valor.toString(), // Converter numero para string pro input
          dataVencimento: dataVencimentoFormatada,
          status: data.status
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/contas-pagar/${id}`, {
        method: 'PATCH', // ou PUT, dependendo da sua API
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valor: parseFloat(formData.valor), // Converte de volta para numero
          dataVencimento: new Date(formData.dataVencimento).toISOString()
        }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar conta');
      
      router.push('/financeiro'); // Volta para a lista
      router.refresh(); // Atualiza os dados da listagem
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/contas-pagar/${id}`, { method: 'DELETE' });
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

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin w-8 h-8 mx-auto text-blue-600"/></div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Editar Conta a Pagar</h1>
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
                <option value="PAGO">Pago</option>
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
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2" />}
            Salvar Alterações
          </button>
        </div>
      </form>

      {/* Modal de Exclusão também aqui dentro, caso queira excluir direto da edição */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Conta a Pagar"
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