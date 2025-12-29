// app/(main)/financeiro/contas-receber/novo/page.tsx

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface Projeto {
  id: string;
  nome: string;
}

interface FormData {
  descricao: string;
  valor: string;
  dataVencimento: string;
  projetoId: string;
}

// 1. Movemos toda a lógica que usa useSearchParams para este componente interno
function FormularioContaReceber() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projetoIdFromQuery = searchParams.get('projetoId');

  const [formData, setFormData] = useState<FormData>({
    descricao: '',
    valor: '',
    dataVencimento: '',
    projetoId: projetoIdFromQuery || '',
  });

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchProjetos() {
      try {
        const res = await fetch('/api/projetos');
        if (res.ok) {
          const data = await res.json();
          setProjetos(data);
        }
      } catch (err) {
        console.error('Erro ao buscar projetos:', err);
      }
    }
    fetchProjetos();
  }, []);

  // Se o ID vier da URL, atualiza o form quando a lista de projetos carregar ou mudar
  useEffect(() => {
    if (projetoIdFromQuery) {
        setFormData(prev => ({ ...prev, projetoId: projetoIdFromQuery }));
    }
  }, [projetoIdFromQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      setError('Descrição, valor e data de vencimento são obrigatórios.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/contas-receber', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao criar conta a receber');
      }

      setSuccess('Conta a receber criada com sucesso!');
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
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/financeiro"
          className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold">Nova Conta a Receber</h1>
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
              placeholder="Ex: Pagamento de projeto"
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

          <div>
            <label className="block text-sm font-medium mb-1">Projeto (Opcional)</label>
            <select
              name="projetoId"
              value={formData.projetoId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione um projeto</option>
              {projetos.map((projeto) => (
                <option key={projeto.id} value={projeto.id}>
                  {projeto.nome}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Criar Conta a Receber
          </button>
        </form>
      </div>
    </>
  );
}

// 2. O export default renderiza o formulário dentro de um Suspense Boundary
export default function NovaContaReceberPage() {
  return (
    <div className="p-6">
      <Suspense fallback={
        <div className="flex items-center justify-center h-40">
          <Loader2 className="animate-spin text-gray-500" />
        </div>
      }>
        <FormularioContaReceber />
      </Suspense>
    </div>
  );
}