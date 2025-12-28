// app/(main)/clientes/novo/page.tsx

'use client'; // Componente Cliente para gerenciar o estado e submeter o formulário

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Tipagem baseada nos campos que a API espera
interface FormData {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
}

export default function NovoClientePage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        nome: '',
        email: '',
        telefone: '',
        endereco: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

        // Validação básica
        if (!formData.nome || !formData.email) {
            setError('Os campos Nome e E-mail são obrigatórios.');
            setIsLoading(false);
            return;
        }

        try {
            // Envia os dados para a API POST /api/clientes
            const res = await fetch('/api/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                // Exibe a mensagem de erro do backend (ex: email duplicado)
                setError(data.message || 'Erro desconhecido ao salvar o cliente.');
                return;
            }

            setSuccess('Cliente salvo com sucesso!');

            // Redireciona para a lista de clientes após o sucesso
            router.push('/clientes');

        } catch (err) {
            setError('Erro de rede ou servidor.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">👤 Cadastrar Novo Cliente</h1>
                <Link
                    href="/clientes"
                    className="flex items-center text-blue-600 hover:text-blue-800 transition duration-150"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para a Lista
                </Link>
            </div>

            {/* Mensagens de feedback */}
            {error && <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4">{success}</div>}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">

                {/* Nome do Cliente */}
                <div className="mb-4">
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="nome"
                        id="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail <span className="text-red-500">*</span></label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                {/* Telefone */}
                <div className="mb-4">
                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input
                        type="tel"
                        name="telefone"
                        id="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="(xx) xxxxx-xxxx"
                    />
                </div>

                {/* Endereço */}
                <div className="mb-6">
                    <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">Endereço</label>
                    <textarea
                        name="endereco"
                        id="endereco"
                        rows={2}
                        value={formData.endereco}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Botão de Envio */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                        'Salvar Cliente'
                    )}
                </button>
            </form>
        </div>
    );
}
