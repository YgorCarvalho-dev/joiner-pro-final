'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CreditCard, CalendarClock, FolderKanban } from 'lucide-react';

interface Projeto {
  id: string;
  nome: string;
}

interface FormData {
  descricao: string;
  valor: string;
  dataVencimento: string;
  projetoId: string;
  metodoPagamento: string;
  parcelas: string;
}

function FormularioContaReceber() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projetoIdFromQuery = searchParams.get('projetoId');

  const [formData, setFormData] = useState<FormData>({
    descricao: '',
    valor: '',
    dataVencimento: new Date().toISOString().split('T')[0], // Padrão hoje
    projetoId: projetoIdFromQuery || '',
    metodoPagamento: 'DINHEIRO',
    parcelas: '1',
  });

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Opções para os selects
  const metodosPagamento = [
    { value: 'DINHEIRO', label: 'Dinheiro' },
    { value: 'PIX', label: 'Pix' },
    { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
    { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
    { value: 'BOLETO', label: 'Boleto' },
    { value: 'CHEQUE', label: 'Cheque' },
  ];

  const opcoesParcelamento = [
    { value: '1', label: 'À Vista (Recebido Agora)' },
    { value: '2', label: '2x (Mensal)' },
    { value: '3', label: '3x (Mensal)' },
    { value: '4', label: '4x (Mensal)' },
    { value: '5', label: '5x (Mensal)' },
    { value: '6', label: '6x (Mensal)' },
    { value: '10', label: '10x (Mensal)' },
    { value: '12', label: '12x (Mensal)' },
  ];

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
      setError('Preencha a descrição, valor e data.');
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

      setSuccess('Lançamento realizado com sucesso!');
      setTimeout(() => {
        router.push('/financeiro');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md border">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-6 border-b pb-4">
            <Link
            href="/financeiro"
            className="text-gray-500 hover:text-blue-600 transition"
            >
            <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Nova Conta a Receber</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
            <input
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Ex: Entrada do Projeto Cozinha"
              required
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Valor (R$)</label>
              <input
                type="number"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {formData.parcelas === '1' ? 'Data do Recebimento' : '1ª Vencimento'}
              </label>
              <input
                type="date"
                name="dataVencimento"
                value={formData.dataVencimento}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Vínculo com Projeto (Campo Exclusivo do Contas a Receber) */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
               <FolderKanban className="w-4 h-4 mr-1 text-gray-500"/> Vincular a Projeto (Opcional)
            </label>
            <select
              name="projetoId"
              value={formData.projetoId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
            >
              <option value="">-- Sem vínculo --</option>
              {projetos.map((projeto) => (
                <option key={projeto.id} value={projeto.id}>
                  {projeto.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Forma de Pagamento e Parcelas */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
             
             {/* Select de Método */}
             <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                    <CreditCard className="w-4 h-4 mr-1 text-gray-500"/> Forma Rec.
                </label>
                <select
                    name="metodoPagamento"
                    value={formData.metodoPagamento}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                    {metodosPagamento.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
             </div>

             {/* Select de Parcelas */}
             <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                    <CalendarClock className="w-4 h-4 mr-1 text-gray-500"/> Condição
                </label>
                <select
                    name="parcelas"
                    value={formData.parcelas}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                    {opcoesParcelamento.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>
             </div>
          </div>

          {/* Aviso visual */}
          <div className="text-xs text-gray-500 px-1">
            {formData.parcelas === '1' ? (
                 <span className="text-green-600 font-medium">✨ Ao salvar, constará como RECEBIDO no caixa hoje.</span>
            ) : (
                 <span>📅 Serão geradas <strong>{formData.parcelas} contas</strong> a receber a cada 30 dias.</span>
            )}
          </div>

          {error && <div className="bg-red-100 text-red-700 p-3 rounded text-sm text-center">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-3 rounded text-sm text-center">{success}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-sm transition-all"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : null}
            {formData.parcelas === '1' ? 'Confirmar Recebimento à Vista' : 'Gerar Parcelamento'}
          </button>
        </form>
      </div>
    </div>
  );
}

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