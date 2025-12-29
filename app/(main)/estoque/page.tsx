import React from 'react';
import Link from 'next/link';
import { Plus, Package } from 'lucide-react'; // Ícone para "Estoque"
import { unstable_noStore } from 'next/cache'; // Importa o noStore
export const dynamic = 'force-dynamic';

// Tipagem dos dados (importante para o TypeScript)
interface Categoria {
  id: string;
  nome: string;
}
interface Insumo {
  id: string;
  nome: string;
  unidadeMedida: string; // Ex: UN, M2, M, KG
  // --- CORREÇÃO AQUI ---
  estoqueAtual: number;  // Corrigido de 'quantidade' para 'estoqueAtual'
  estoqueMinimo: number;
  precoCusto: number;
  categoria: Categoria; // Objeto Categoria aninhado
}

/**
 * Função de busca de dados (executada no lado do servidor)
 * Busca os dados da API que acabamos de criar.
 */
async function getInsumos(): Promise<Insumo[]> {
  // Desativa o cache para dados de estoque
  unstable_noStore(); 
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error("Variável de ambiente NEXT_PUBLIC_BASE_URL não definida.");
  }

  const res = await fetch(`${baseUrl}/api/estoque`, {
    cache: 'no-store', // Estoque deve ser sempre atualizado
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})); // Tenta pegar a mensagem de erro da API
    console.error("Erro da API de Estoque:", errorData.message || res.statusText);
    throw new Error(`Falha ao buscar dados do estoque. (Status: ${res.status})`);
  }
  return res.json();
}


export default async function EstoquePage() {
  let insumos: Insumo[] = [];
  let error: string | null = null;

  try {
    insumos = await getInsumos();
  } catch (e) {
    error = (e as Error).message;
    console.error(e);
  }

  return (
    <div>
      {/* Cabeçalho da Página */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Package className="w-8 h-8 mr-3" />
          Gestão de Estoque (Insumos)
        </h1>
        <div className="flex space-x-2">
            <Link 
              href="/estoque/categorias" // Link para gerenciar categorias
              className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
            >
                Gerenciar Categorias
            </Link>
            <Link 
              href="/estoque/novo" // Link para o formulário de novo insumo
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
            >
                <Plus className="w-5 h-5 mr-2" />
                Novo Insumo
            </Link>
        </div>
      </div>
      
      {/* Mensagem de Erro (se houver) */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline"><strong>Erro:</strong> {error}</span>
        </div>
      )}

      {/* Tabela de Insumos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumo (Item)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd. em Estoque</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Custo (Unit.)</th>
              <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {insumos.map((item) => (
              <tr key={item.id} className={`hover:bg-gray-50 ${item.estoqueAtual <= item.estoqueMinimo ? 'bg-red-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {item.categoria.nome}
                  </span>
                </td>
                
                {/* --- CORREÇÃO AQUI --- */}
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${item.estoqueAtual <= item.estoqueMinimo ? 'text-red-600' : 'text-gray-700'}`}>
                  {item.estoqueAtual}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unidadeMedida}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.precoCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/estoque/${item.id}`} className="text-indigo-600 hover:text-indigo-900">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Mensagem de Tabela Vazia */}
        {insumos.length === 0 && !error && (
            <div className="text-center py-8 text-gray-500">
                Nenhum insumo cadastrado. Comece cadastrando as <Link href="/estoque/categorias" className="text-blue-600 hover:underline">Categorias</Link>.
            </div>
        )}
      </div>
    </div>
  );
}