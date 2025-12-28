// components/ClienteSelect.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Users, AlertTriangle } from 'lucide-react';

// Tipagem baseada na API /api/clientes
interface Cliente {
    id: string;
    nome: string;
    email: string;
    telefone: string;
}

interface ClienteSelectProps {
    // Recebe o ID do cliente selecionado e uma função para atualizar o estado do componente pai
    clienteId: string;
    setClienteId: (id: string) => void;
}

/**
 * Componente que busca e exibe uma lista de clientes em um campo <select>.
 */
export default function ClienteSelect({ clienteId, setClienteId }: ClienteSelectProps) {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Função para buscar os clientes da nossa API
        const fetchClientes = async () => {
            try {
                const res = await fetch('/api/clientes'); // Chamada para a API GET que criamos

                if (!res.ok) {
                    throw new Error('Falha ao carregar a lista de clientes.');
                }

                const data: Cliente[] = await res.json();
                setClientes(data);

                // Se houver clientes e nenhum ID estiver selecionado, define o primeiro como padrão
                if (data.length > 0 && !clienteId) {
                    setClienteId(data[0].id);
                }

            } catch (err) {
                console.error('Erro ao buscar clientes:', err);
                setError('Não foi possível carregar a lista de clientes do banco de dados.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchClientes();
    }, [setClienteId, clienteId]); // Dependências: re-executa se a prop de ID mudar

    if (isLoading) {
        return (
            <div className="flex items-center text-gray-500">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Carregando clientes...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center text-red-600 bg-red-50 p-2 rounded border border-red-300">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {error}
            </div>
        );
    }

    if (clientes.length === 0) {
        return (
            <div className="flex items-center text-orange-600 bg-orange-50 p-2 rounded border border-orange-300">
                <Users className="w-4 h-4 mr-2" />
                Nenhum cliente cadastrado. Por favor, crie um novo cliente primeiro.
                <Link href="/clientes/novo" className="ml-2 text-blue-600 hover:text-blue-800 underline">
                    Cadastrar Cliente
                </Link>
            </div>
        );
    }

    return (
        <select
            name="clienteId"
            id="clienteId"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            required
        >
            <option value="" disabled>Selecione um cliente</option>
            {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} ({cliente.telefone})
                </option>
            ))}
        </select>
    );
}
