'use client'; // Esta página é um formulário complexo, usamos 'client'

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, notFound } from 'next/navigation';
import useSWR from 'swr'; // Usamos SWR para buscar os dados
import { ArrowLeft, Save, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from '@/components/Modal'; // Importa o Modal de confirmação

// --- TIPAGEM ---
interface Categoria {
  id: string;
  nome: string;
}
interface Insumo {
  id: string;
  nome: string;
  descricao: string | null;
  unidadeMedida: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  precoCusto: number;
  categoriaId: string;
}
interface FormData {
    nome: string;
    descricao: string;
    categoriaId: string;
    unidadeMedida: string;
    estoqueAtual: string;
    estoqueMinimo: string;
    precoCusto: string;
}

// Fetcher (Buscador de dados) para o SWR
const fetcher = (url: string) => fetch(url).then(res => {
    if (res.status === 404) notFound();
    if (!res.ok) throw new Error('Falha ao buscar dados.');
    return res.json();
});

// Opções de Unidade de Medida
const unidadesMedida = [
  { id: 'UN', nome: 'Unidade (UN)' },
  { id: 'M', nome: 'Metro Linear (M)' },
  { id: 'M2', nome: 'Metro Quadrado (M2)' },
  { id: 'KG', nome: 'Quilograma (KG)' },
  { id: 'L', nome: 'Litro (L)' },
  { id: 'CX', nome: 'Caixa (CX)' },
];

/**
 * Página de Edição de Insumo
 */
function InsumoEditPage(props: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // 1. Resolve o bug 'params is a Promise' do Next.js/Turbopack
  const params = use(props.params);
  const { id } = params;

  // 2. Estado do Formulário
  const [formData, setFormData] = useState<FormData | null>(null); // Inicia nulo
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 3. Busca de Dados (SWR)
  // Busca o Insumo específico
  const { data: insumoData, error: insumoError, isLoading: isLoadingInsumo } = 
    useSWR<Insumo>(`/api/estoque/${id}`, fetcher);
  
  // Busca TODAS as categorias (para o <select>)
  const { data: categorias, error: categoriasError, isLoading: isLoadingCategorias } = 
    useSWR<Categoria[]>('/api/estoque/categorias', fetcher);

  // 4. Efeito para preencher o formulário QUANDO os dados chegarem
  useEffect(() => {
    if (insumoData) {
      setFormData({
        nome: insumoData.nome,
        descricao: insumoData.descricao || '',
        categoriaId: insumoData.categoriaId,
        unidadeMedida: insumoData.unidadeMedida,
        // Converte os números para string (formato BR com vírgula)
        estoqueAtual: String(insumoData.estoqueAtual).replace('.', ','),
        estoqueMinimo: String(insumoData.estoqueMinimo).replace('.', ','),
        precoCusto: String(insumoData.precoCusto).replace('.', ','),
      });
    }
  }, [insumoData]); // Roda sempre que 'insumoData' mudar

  // 5. Handlers (Manipuladores de Ação)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // PATCH (Atualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setError(null);
    setIsSaving(true);

    try {
      const res = await fetch(`/api/estoque/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Envia o estado completo (API vai parsear)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Falha ao salvar o insumo.');
      }

      router.push('/estoque'); // Sucesso, volta para a lista

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // DELETE (Deletar)
  const handleDeleteConfirm = async () => {
    setIsModalOpen(false);
    setIsDeleting(true);
    setError(null);

    try {
        const res = await fetch(`/api/estoque/${id}`, { method: 'DELETE' });
        if (res.status === 204) {
            router.push('/estoque'); // Sucesso
        } else {
            const data = await res.json();
            throw new Error(data.message || "Falha ao deletar.");
        }
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsDeleting(false);
    }
  };

  // --- RENDERIZAÇÃO ---

  // Estados de Carregamento e Erro
  if (isLoadingInsumo || isLoadingCategorias) {
    return <div className="text-center p-10"><Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" /> Carregando dados...</div>;
  }
  if (insumoError) return <div className="text-center p-10 text-red-600">Erro ao carregar insumo: {insumoError.message}</div>;
  if (categoriasError) return <div className="text-center p-10 text-red-600">Erro ao carregar categorias: {categoriasError.message}</div>;
  
  // Se o formulário ainda não foi preenchido (esperando useEffect)
  if (!formData) {
     return <div className="text-center p-10"><Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" /> Preparando formulário...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Editar Insumo</h1>
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
                <AlertTriangle className="w-5 h-5 inline-block mr-2" />
                {error}
            </div>
        )}

        {/* Linha 1: Nome e Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Insumo <span className="text-red-500">*</span></label>
            <input 
              type="text" name="nome" id="nome" 
              value={formData.nome} onChange={handleChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
              required
            />
          </div>
          <div>
            <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700">Categoria <span className="text-red-500">*</span></label>
            <select 
              name="categoriaId" id="categoriaId" 
              value={formData.categoriaId} onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
              required
            >
              <option value="" disabled>Selecione...</option>
              {categorias?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha 2: Unidade de Medida e Preço de Custo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="unidadeMedida" className="block text-sm font-medium text-gray-700">Unidade de Medida <span className="text-red-500">*</span></label>
                <select 
                    name="unidadeMedida" id="unidadeMedida" 
                    value={formData.unidadeMedida} onChange={handleChange}
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
                    type="text" name="precoCusto" id="precoCusto" 
                    value={formData.precoCusto} onChange={handleChange} 
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
                    type="text" name="estoqueAtual" id="estoqueAtual" 
                    value={formData.estoqueAtual} onChange={handleChange} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                />
            </div>
            <div>
                <label htmlFor="estoqueMinimo" className="block text-sm font-medium text-gray-700">Estoque Mínimo (Alerta)</label>
                <input 
                    type="text" name="estoqueMinimo" id="estoqueMinimo" 
                    value={formData.estoqueMinimo} onChange={handleChange} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                />
            </div>
        </div>

        {/* Linha 4: Descrição */}
        <div className="mb-6">
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
          <textarea 
            name="descricao" id="descricao" rows={3}
            value={formData.descricao} onChange={handleChange} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center">
            {/* Botão Deletar (Lado Esquerdo) */}
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={isSaving || isDeleting}
                className="flex justify-center items-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
                {isDeleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Trash2 className="w-5 h-5" />
                )}
                <span className="ml-2">Deletar Insumo</span>
            </button>
            
            {/* Botão Salvar (Lado Direito) */}
            <button
                type="submit"
                disabled={isSaving || isDeleting || isLoadingInsumo || isLoadingCategorias}
                className="flex justify-center items-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
                {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Save className="w-5 h-5 mr-2" />
                )}
                Salvar Alterações
            </button>
        </div>
      </form>
      
      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        confirmText="Sim, Deletar Insumo"
        cancelText="Cancelar"
      >
        Tem certeza que deseja DELETAR este insumo? Esta ação é irreversível.
      </Modal>
    </div>
  );
}

// O export default (necessário para o 'use')
export default function InsumoEditWrapper(props: { params: Promise<{ id: string }> }) {
    return <InsumoEditPage {...props} />;
}