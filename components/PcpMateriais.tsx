'use client'; // Componente 100% client-side

import React, { useState } from 'react';
import useSWR from 'swr';
import { Loader2, Plus, AlertTriangle, Trash2 } from 'lucide-react';

// --- FUNÇÃO AUXILIAR PARA FORMATAR R$ ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Tipagem do Insumo (do Estoque)
interface InsumoEstoque {
  id: string;
  nome: string;
  unidadeMedida: string;
  estoqueAtual: number;
  precoCusto: number; // Adicionado para mostrar no select
}

// Tipagem do InsumoDoProjeto (Lista de Materiais)
interface MaterialDoProjeto {
  id: string;
  quantidadeUsada: number;
  insumo: { 
    id: string;
    nome: string;
    unidadeMedida: string;
    precoCusto: number; // O PREÇO VEM DAQUI (Do include no backend)
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface PcpMateriaisProps {
  projetoId: string;
}

export default function PcpMateriais({ projetoId }: PcpMateriaisProps) {
  
  // 1. Estados do Formulário
  const [insumoId, setInsumoId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // 2. Busca (SWR) dos MATERIAIS JÁ ADICIONADOS
  const { 
    data: materiaisDoProjeto, 
    error: materiaisError, 
    isLoading: isLoadingMateriais,
    mutate: mutateMateriais 
  } = useSWR<MaterialDoProjeto[]>(`/api/projetos/${projetoId}/materiais`, fetcher);

  // 3. Busca (SWR) de TODOS OS INSUMOS
  const { 
    data: insumosDoEstoque, 
    error: estoqueError, 
    isLoading: isLoadingEstoque 
  } = useSWR<InsumoEstoque[]>('/api/estoque', fetcher);

  // 4. CÁLCULO DO CUSTO TOTAL (SOMA GERAL)
  const custoTotalGeral = materiaisDoProjeto?.reduce((acc, item) => {
      const qtd = Number(item.quantidadeUsada) || 0;
      const preco = Number(item.insumo.precoCusto) || 0;
      return acc + (qtd * preco);
  }, 0) || 0;

  // 5. Handler: Adicionar Material
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insumoId) {
        setAddError('Selecione um insumo.');
        return;
    }
    
    setIsAdding(true);
    setAddError(null);

    try {
        const res = await fetch(`/api/projetos/${projetoId}/materiais`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                insumoId: insumoId,
                quantidadeUsada: quantidade
            })
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Falha ao adicionar material.');
        }

        setInsumoId('');
        setQuantidade('1');
        mutateMateriais(); 

    } catch (err: any) {
        setAddError(err.message);
    } finally {
        setIsAdding(false);
    }
  };

  // 6. Handler: Deletar Material (Agora chamando a rota correta)
const handleDeleteMaterial = async (materialId: string) => {
      if(!confirm("Tem certeza que deseja remover este item?")) return;

      try {
          // ATENÇÃO: A URL agora inclui o projetoId e o materialId
          // Estrutura: /api/projetos/[PROJETO_ID]/materiais/[MATERIAL_ID]
          const res = await fetch(`/api/projetos/${projetoId}/materiais/${materialId}`, {
              method: 'DELETE'
          });

          if (!res.ok) throw new Error('Falha ao deletar');

          // Atualiza a lista removendo o item visualmente
          mutateMateriais(); 

      } catch (error) {
          console.error(error);
          alert('Erro ao excluir. Verifique se a pasta foi renomeada para [itemId].');
      }
  };

  // --- RENDERIZAÇÃO ---
  
  if (isLoadingMateriais || isLoadingEstoque) {
    return <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }
  
  if (materiaisError || estoqueError) {
    return (
        <div className="flex items-center text-red-600 bg-red-50 p-3 rounded border border-red-300">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Erro ao carregar dados.
        </div>
    );
  }

  return (
    <div className="pt-6 text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Coluna 1: Formulário de Adição */}
        <div className="md:col-span-1">
            <div className="bg-white p-4 rounded-lg border shadow-sm sticky top-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Adicionar Material</h3>
                <form onSubmit={handleAddMaterial} className="space-y-4">
                    {addError && (
                        <div className="text-red-700 bg-red-100 p-3 rounded text-sm">
                            {addError}
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="insumoId" className="block text-sm font-medium text-gray-700">Insumo do Estoque</label>
                        <select 
                            id="insumoId"
                            value={insumoId}
                            onChange={(e) => setInsumoId(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                        >
                            <option value="" disabled>Selecione...</option>
                            {insumosDoEstoque?.map(insumo => (
                                <option key={insumo.id} value={insumo.id}>
                                    {insumo.nome} ({formatCurrency(insumo.precoCusto)})
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700">Quantidade</label>
                        <input 
                            type="text"
                            id="quantidade"
                            value={quantidade}
                            onChange={(e) => setQuantidade(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="Ex: 1.5"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
                        Adicionar
                    </button>
                </form>
            </div>
        </div>
        
        {/* Coluna 2: Lista de Materiais Adicionados */}
        <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Lista de Materiais (BOM)</h3>
            
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Material</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Qtd.</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">V. Unit.</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Subtotal</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {materiaisDoProjeto && materiaisDoProjeto.length > 0 ? (
                            materiaisDoProjeto.map(mat => {
                                const qtd = Number(mat.quantidadeUsada);
                                const preco = Number(mat.insumo.precoCusto) || 0;
                                const subtotal = qtd * preco;

                                return (
                                    <tr key={mat.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                                            {mat.insumo.nome}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                                                {mat.quantidadeUsada} {mat.insumo.unidadeMedida}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 text-right">
                                            {formatCurrency(preco)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-bold">
                                            {formatCurrency(subtotal)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                onClick={() => handleDeleteMaterial(mat.id)}
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition"
                                                title="Remover Item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                                    Nenhum material adicionado a este projeto.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* CARD DE TOTALIZADOR GERAL */}
            {materiaisDoProjeto && materiaisDoProjeto.length > 0 && (
                <div className="flex justify-end">
                    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md text-right min-w-[220px]">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Custo Total de Materiais</p>
                        <p className="text-2xl font-bold text-green-400">
                            {formatCurrency(custoTotalGeral)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}