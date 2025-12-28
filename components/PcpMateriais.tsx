'use client'; // Componente 100% client-side

import React, { useState } from 'react';
import useSWR from 'swr';
import { Loader2, Plus, AlertTriangle, Trash2, Package } from 'lucide-react';

// Tipagem do Insumo (do Estoque)
interface InsumoEstoque {
  id: string;
  nome: string;
  unidadeMedida: string;
  estoqueAtual: number;
}

// Tipagem do InsumoDoProjeto (Lista de Materiais)
interface MaterialDoProjeto {
  id: string;
  quantidadeUsada: number;
  insumo: { // Dados do insumo incluído
    id: string;
    nome: string;
    unidadeMedida: string;
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Propriedade: Recebe o ID do Projeto
interface PcpMateriaisProps {
  projetoId: string;
}

export default function PcpMateriais({ projetoId }: PcpMateriaisProps) {
  
  // 1. Estados do Formulário de Adição
  const [insumoId, setInsumoId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // 2. Busca (SWR) dos MATERIAIS JÁ ADICIONADOS a este projeto
  const { 
    data: materiaisDoProjeto, 
    error: materiaisError, 
    isLoading: isLoadingMateriais,
    mutate: mutateMateriais // Função para revalidar a lista
  } = useSWR<MaterialDoProjeto[]>(`/api/projetos/${projetoId}/materiais`, fetcher);

  // 3. Busca (SWR) de TODOS OS INSUMOS (para o <select>)
  const { 
    data: insumosDoEstoque, 
    error: estoqueError, 
    isLoading: isLoadingEstoque 
  } = useSWR<InsumoEstoque[]>('/api/estoque', fetcher);

  // 4. Handler: Adicionar Material
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

        // Sucesso: Limpa os campos e revalida a lista de materiais
        setInsumoId('');
        setQuantidade('1');
        mutateMateriais(); 

    } catch (err: any) {
        setAddError(err.message);
    } finally {
        setIsAdding(false);
    }
  };

  // 5. Handler: Deletar Material (API ainda não criada, só o placeholder)
  const handleDeleteMaterial = async (materialId: string) => {
      alert(`API DELETE para /api/projetos/materiais/${materialId} ainda não implementada.`);
      // (Implementação futura: chamar a API DELETE e depois 'mutateMateriais()')
  };

  // --- RENDERIZAÇÃO ---
  
  if (isLoadingMateriais || isLoadingEstoque) {
    return <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }
  
  if (materiaisError || estoqueError) {
    return (
        <div className="flex items-center text-red-600 bg-red-50 p-3 rounded border border-red-300">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Erro ao carregar dados de materiais ou estoque.
        </div>
    );
  }

  return (
    <div className="pt-6 text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Coluna 1: Formulário de Adição */}
        <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Adicionar Material ao Projeto</h3>
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
                        <option value="" disabled>Selecione um insumo...</option>
                        {insumosDoEstoque?.map(insumo => (
                            <option key={insumo.id} value={insumo.id}>
                                {insumo.nome} ({insumo.estoqueAtual} {insumo.unidadeMedida})
                            </option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700">Quantidade Necessária</label>
                    <input 
                        type="text"
                        id="quantidade"
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Ex: 5"
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
        
        {/* Coluna 2: Lista de Materiais Adicionados */}
        <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Lista de Materiais (BOM)</h3>
            <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qtd. Usada</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {materiaisDoProjeto && materiaisDoProjeto.length > 0 ? (
                            materiaisDoProjeto.map(mat => (
                                <tr key={mat.id}>
                                    <td className="px-4 py-3 text-sm text-gray-700">{mat.insumo.nome}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-bold">{mat.quantidadeUsada} {mat.insumo.unidadeMedida}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => handleDeleteMaterial(mat.id)}
                                            className="text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">Nenhum material adicionado a este projeto.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}