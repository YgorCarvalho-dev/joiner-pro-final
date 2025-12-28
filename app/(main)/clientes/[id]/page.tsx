'use client'; // Página de cliente com busca de dados via SWR

import React, { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Loader2, User, Phone, Mail, Home, Package } from 'lucide-react';
import useSWR from 'swr';

// Tipagem
interface Projeto { id: string; nome: string; status: string; valorTotal: number; }
interface Cliente {
    id: string; nome: string; email: string | null; telefone: string | null; endereco: string | null;
    projetos: Projeto[];
}

// Fetcher do SWR
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (res.status === 404) notFound(); // Redireciona para 404 se o cliente não existir
    if (!res.ok) throw new Error('Falha ao buscar dados do cliente.');
    return res.json();
};

// Componente Card de Informação
const InfoCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | null }) => (
    <div className="flex items-center bg-white p-4 rounded-lg shadow-sm border">
        <div className="p-2 bg-gray-100 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-lg font-semibold text-gray-900">{value || 'Não informado'}</p>
        </div>
    </div>
);

// Componente Principal
function ClienteDetalhesPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params); // Resolve a promise dos params

    const { data: cliente, error, isLoading } = useSWR<Cliente>(
        `/api/clientes/${params.id}`,
        fetcher
    );

    if (isLoading) return <div className="text-center p-10"><Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" /> Carregando Cliente...</div>;
    if (error) return <div className="text-center p-10 text-red-600">Erro: {error.message}</div>;
    if (!cliente) return null;

    return (
        <div>
            {/* Cabeçalho */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <Link href="/clientes" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Todos os Clientes
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                        <User className="w-8 h-8 mr-3 text-blue-600" />
                        {cliente.nome}
                    </h1>
                </div>
                {/* (Você pode adicionar um botão "Editar Cliente" aqui) */}
            </div>

            {/* Informações de Contato */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <InfoCard icon={<Mail className="w-5 h-5 text-gray-600" />} title="E-mail" value={cliente.email} />
                <InfoCard icon={<Phone className="w-5 h-5 text-gray-600" />} title="Telefone" value={cliente.telefone} />
                <InfoCard icon={<Home className="w-5 h-5 text-gray-600" />} title="Endereço" value={cliente.endereco} />
            </div>

            {/* Histórico de Projetos */}
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 mt-6">Histórico de Projetos ({cliente.projetos.length})</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <ul className="divide-y divide-gray-200">
                    {cliente.projetos.length > 0 ? cliente.projetos.map(proj => (
                        <li key={proj.id} className="py-4 flex justify-between items-center">
                            <div>
                                <Link href={`/projetos/${proj.id}`} className="text-lg font-medium text-blue-700 hover:underline">{proj.nome}</Link>
                                <p className="text-sm text-gray-500">{proj.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                                ${proj.status === 'CONCLUIDO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {proj.status.replace('_', ' ')}
                            </span>
                        </li>
                    )) : (
                        <p className="text-gray-500">Nenhum projeto encontrado para este cliente.</p>
                    )}
                </ul>
            </div>
        </div>
    );
}

// Wrapper para SWR e Export Default
export default function ClienteDetalhesWrapper(props: { params: Promise<{ id: string }> }) {
    return <ClienteDetalhesPage {...props} />;
}
