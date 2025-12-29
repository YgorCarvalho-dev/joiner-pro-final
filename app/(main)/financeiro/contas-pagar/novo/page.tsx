// app/(main)/financeiro/contas-pagar/novo/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface FormData {
  descricao: string;
  valor: string;
  dataVencimento: string;
}

export default function NovaContaPagarPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    descricao: '',
    valor: '',
    dataVencimento: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!formData.descricao || !formData.valor || !formData.dataVencimento) {
      setError('Todos os campos são obrigatórios.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/contas-pagar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao criar conta a pagar');
      }

      setSuccess('Conta a pagar criada com sucesso!');
      setTimeout(() => {
        router.push('/financeiro');
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/financeiro"
          className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold">Nova Conta a Pagar</h1>
      </div>

      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <input
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: Pagamento de fornecedor"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valor (R$)</label>
            <input
              type="number"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data de Vencimento</label>
            <input
              type="date"
              name="dataVencimento"
              value={formData.dataVencimento}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Criar Conta a Pagar
          </button>
        </form>
      </div>
    </div>
  );
}