// app/(main)/clientes/page.tsx
// Componente Servidor para carregar a lista de clientes do MySQL

import React from 'react';
import Link from 'next/link';
import { Plus, User, Mail, Phone } from 'lucide-react';
import { unstable_noStore } from 'next/cache';

// Tipagem baseada nos dados que virão da API
interface Cliente {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
    endereco: string | null;
    criadoEm: string;
    // O Prisma retorna um objeto de contagem
    _count: {
        projetos: number;
    }
}

// Função de busca de dados (executada no servidor Next.js)
async function getClientes(): Promise<Cliente[]> {
    // Desativa o cache de renderização para obter dados mais recentes
    unstable_noStore();

    // O fetch chama a nossa API Route /api/clientes
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/clientes`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error('Falha ao buscar clientes do banco de dados');
    }

    return res.json();
}

export default async function ClientesPage() {
    let clientes: Cliente[] = [];
    let error: string | null = null;

    try {
        clientes = await getClientes();
    } catch (e) {
        error = (e as Error).message;
        console.error(e);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">👥 Gestão de Clientes</h1>
                <Link
                    href="/clientes/novo"
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Cliente
                </Link>
            </div>

            {/* Mensagem de erro de busca */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Tabela de Clientes */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nome
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contato
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Projetos
                            </th>
                            <th className="relative px-6 py-3">
                                <span className="sr-only">Ações</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {clientes.map((cliente) => (
                            <tr key={cliente.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 mr-2 text-gray-500" />
                                        {cliente.nome}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex flex-col">
                                        <span className="flex items-center"><Mail className="w-3 h-3 mr-1" /> {cliente.email}</span>
                                        {/* Apenas exibe o telefone se ele não for nulo */}
                                        {cliente.telefone && <span className="flex items-center"><Phone className="w-3 h-3 mr-1" /> {cliente.telefone}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${cliente._count.projetos > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {cliente._count.projetos}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {/* Link para detalhes futuros: /clientes/[id] */}
                                    <Link href={`/clientes/${cliente.id}`} className="text-indigo-600 hover:text-indigo-900">
                                        Ver Detalhes
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Mensagem se não houver clientes */}
                {clientes.length === 0 && !error && (
                    <div className="text-center py-8 text-gray-500">Nenhum cliente cadastrado.</div>
                )}
            </div>
        </div>
    );
}