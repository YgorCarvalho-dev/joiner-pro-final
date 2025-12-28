'use client'; // Formulário interativo

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr'; // Para buscar as categorias
import { ArrowLeft, Plus, Loader2, AlertTriangle } from 'lucide-react';

// Tipagem da Categoria
interface Categoria {
  id: string;
  nome: string;
}

// Fetcher (Buscador de dados) para o SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Opções de Unidade de Medida
const unidadesMedida = [
  { id: 'UN', nome: 'Unidade (UN)' },
  { id: 'M', nome: 'Metro Linear (M)' },
  { id: 'M2', nome: 'Metro Quadrado (M2)' },
  { id: 'KG', nome: 'Quilograma (KG)' },
  { id: 'L', nome: 'Litro (L)' },
  { id: 'CX', nome: 'Caixa (CX)' },
];

export default function NovoInsumoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoriaId: '',
    unidadeMedida: 'UN',
    estoqueAtual: '0',
    estoqueMinimo: '0',
    precoCusto: '0',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook SWR: Busca as categorias da API
  const { data: categorias, error: swrError, isLoading: isLoadingCategorias } = 
    useSWR<Categoria[]>('/api/estoque/categorias', fetcher);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação
    if (!formData.categoriaId) {
      setError('Por favor, selecione uma categoria.');
      return;
    }

    setIsLoading(true);

    try {
      // Envia para a API POST /api/estoque (que corrigimos)
      const res = await fetch('/api/estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Falha ao salvar o insumo.');
      }

      router.push('/estoque'); // Sucesso, volta para a lista

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Adicionar Novo Insumo</h1>
        <Link 
          href="/estoque"
          className="flex items-center text-blue-600 hover:text-blue-800 transition duration-150"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Estoque
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 text-sm">
                {error}
            </div>
        )}

        {/* Linha 1: Nome e Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Insumo <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="nome" 
              id="nome" 
              value={formData.nome} 
              onChange={handleChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
              required
            />
          </div>
          <div>
            <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700">Categoria <span className="text-red-500">*</span></label>
            {isLoadingCategorias && <div className="mt-1 p-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-500">Carregando categorias...</div>}
            {swrError && <div className="mt-1 p-2 border border-red-300 rounded-md bg-red-50 text-sm text-red-700">Erro ao buscar categorias.</div>}
            {categorias && (
              <select 
                name="categoriaId" 
                id="categoriaId" 
                value={formData.categoriaId} 
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                required
              >
                <option value="" disabled>Selecione...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Linha 2: Unidade de Medida e Preço de Custo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="unidadeMedida" className="block text-sm font-medium text-gray-700">Unidade de Medida <span className="text-red-500">*</span></label>
                <select 
                    name="unidadeMedida" 
                    id="unidadeMedida" 
                    value={formData.unidadeMedida} 
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                >
                    {unidadesMedida.map(un => (
                        <option key={un.id} value={un.id}>{un.nome}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="precoCusto" className="block text-sm font-medium text-gray-700">Preço de Custo (Unitário) <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    name="precoCusto" 
                    id="precoCusto" 
                    value={formData.precoCusto} 
                    onChange={handleChange} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                    placeholder="Ex: 250,50"
                />
            </div>
        </div>
        
        {/* Linha 3: Estoque Atual e Mínimo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="estoqueAtual" className="block text-sm font-medium text-gray-700">Estoque Atual <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    name="estoqueAtual" 
                    id="estoqueAtual" 
                    value={formData.estoqueAtual} 
                    onChange={handleChange} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                />
            </div>
            <div>
                <label htmlFor="estoqueMinimo" className="block text-sm font-medium text-gray-700">Estoque Mínimo (Alerta)</label>
                <input 
                    type="text" 
                    name="estoqueMinimo" 
                    id="estoqueMinimo" 
                    value={formData.estoqueMinimo} 
                    onChange={handleChange} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                />
            </div>
        </div>

        {/* Linha 4: Descrição */}
        <div className="mb-6">
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
          <textarea 
            name="descricao" 
            id="descricao" 
            rows={3}
            value={formData.descricao} 
            onChange={handleChange} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
          />
        </div>

        {/* Botão de Envio */}
        <div className="flex justify-end">
            <button
                type="submit"
                disabled={isLoading || isLoadingCategorias}
                className="w-full md:w-auto flex justify-center items-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Plus className="w-5 h-5 mr-2" />
                )}
                Salvar Insumo
            </button>
        </div>
      </form>
    </div>
  );
}