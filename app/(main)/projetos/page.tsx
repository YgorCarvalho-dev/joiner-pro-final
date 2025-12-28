// app/(main)/projetos/page.tsx
// Componente Servidor para carregar a lista de projetos do MySQL

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { unstable_noStore } from 'next/cache'; // Para garantir dados atualizados

// Tipagem baseada nos campos definidos no Prisma (AGORA COM PRAZO)
interface Projeto {
  id: string;
  nome: string;
  status: string;
  valorTotal: number;
  // --- NOVOS CAMPOS ---
  prazoEmDias: number;
  dataInicioProducao: string | null; // Vem como string JSON
  cliente: { nome: string }; // Incluído pela API
}

// Função de busca de dados (executada no servidor Next.js)
// Esta função chama a API /api/projetos (que já retorna os novos campos)
async function getProjetos(): Promise<Projeto[]> {
  unstable_noStore(); // Garante que os dados do prazo sejam sempre frescos
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error("Variável de ambiente NEXT_PUBLIC_BASE_URL não definida.");
  }

  const res = await fetch(`${baseUrl}/api/projetos`, {
    cache: 'no-store', 
  });

  if (!res.ok) {
    throw new Error('Falha ao buscar projetos do banco de dados');
  }
  return res.json();
}

// --- (NOVO) COMPONENTE AUXILIAR PARA O CONTADOR ---
const PrazoStatus = ({ projeto }: { projeto: Projeto }) => {
  // Se não estiver em produção ou não tiver data de início, mostra "---"
  if (projeto.status !== 'EM_PRODUCAO' || !projeto.dataInicioProducao) {
    return <span className="text-gray-500">---</span>;
  }

  try {
    const dataInicio = new Date(projeto.dataInicioProducao);
    const prazo = projeto.prazoEmDias || 30; // Garante um prazo padrão

    // Calcula a data final prevista (Data de Início + Prazo)
    const dataFinal = new Date(dataInicio.getTime());
    dataFinal.setDate(dataFinal.getDate() + prazo);

    const hoje = new Date();
    
    // Diferença em milissegundos
    const diffTime = dataFinal.getTime() - hoje.getTime();
    
    // Converte para dias (arredondando para cima, pois o dia de hoje conta)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="font-bold text-red-600">{Math.abs(diffDays)} dias atrasado</span>;
    }
    if (diffDays <= 7) {
      return <span className="font-bold text-yellow-600">{diffDays} dias restantes</span>;
    }
    
    return <span className="text-green-600">{diffDays} dias restantes</span>;

  } catch (e) {
    console.error("Erro ao calcular data:", e);
    return <span className="text-red-500">Erro de data</span>;
  }
};
// --- FIM DO COMPONENTE AUXILIAR ---


export default async function ProjetosPage() {
  let projetos: Projeto[] = [];
  let error: string | null = null;

  try {
    projetos = await getProjetos();
  } catch (e) {
    error = (e as Error).message;
    console.error(e);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📋 Gestão de Projetos</h1>
        <Link 
          href="/projetos/novo" 
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Projeto
        </Link>
      </div>
      
      {/* Mensagem de erro de busca */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Tabela de Projetos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Projeto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {/* --- (A) NOVA COLUNA --- */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo de Entrega</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor (R$)</th>
              <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projetos.map((projeto) => (
              <tr key={projeto.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{projeto.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{projeto.cliente?.nome || 'Cliente não encontrado'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${projeto.status === 'EM_PRODUCAO' ? 'bg-yellow-100 text-yellow-800' : 
                      projeto.status === 'ORCAMENTO' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'}`}>
                    {projeto.status.replace('_', ' ')}
                  </span>
                </td>
                
                {/* --- (B) NOVA COLUNA (RENDERIZA O CONTADOR) --- */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <PrazoStatus projeto={projeto} />
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {projeto.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/projetos/${projeto.id}`} className="text-indigo-600 hover:text-indigo-900">
                    Detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Mensagem se não houver projetos */}
        {projetos.length === 0 && !error && (
            <div className="text-center py-8 text-gray-500">Nenhum projeto encontrado.</div>
        )}
      </div>
    </div>
  );
}