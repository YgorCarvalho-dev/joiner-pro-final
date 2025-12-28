'use client'; // ESSENCIAL para usar hooks de React

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Importa o componente que busca a lista de clientes do MySQL
import ClienteSelect from '@/components/ClienteSelect';

export default function NovoProjetoPage() {
  const router = useRouter();
  
  // O estado agora inclui o prazoEmDias
  const [formData, setFormData] = useState({
    nome: '',
    valorTotal: '',
    descricao: '',
    prazoEmDias: '30', // <-- (B) NOVO CAMPO (Padrão 30 dias)
  });
  const [clienteId, setClienteId] = useState<string>(''); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    if (!formData.nome || !clienteId || !formData.valorTotal) {
        setError('Preencha todos os campos obrigatórios (Nome do Projeto, Cliente e Valor Total).');
        setIsLoading(false);
        return;
    }
    
    try {
      // Envia os dados para a API POST
      const res = await fetch('/api/projetos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          clienteId: clienteId, 
          valorTotal: formData.valorTotal, // Envia como string (Ex: "15.000,50")
          descricao: formData.descricao,
          prazoEmDias: formData.prazoEmDias, // <-- (C) ENVIA O PRAZO
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || 'Erro desconhecido ao salvar o projeto.');
        return;
      }

      setSuccess('Projeto salvo com sucesso!');
      router.push('/projetos'); 

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
        <h1 className="text-3xl font-bold text-gray-800">✨ Novo Projeto</h1>
        <Link 
          href="/projetos" 
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
        
        {/* Nome do Projeto */}
        <div className="mb-4">
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Projeto <span className="text-red-500">*</span></label>
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

        {/* CAMPO CLIENTE: (ClienteSelect) */}
        <div className="mb-4">
          <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700">Cliente <span className="text-red-500">*</span></label>
          <ClienteSelect clienteId={clienteId} setClienteId={setClienteId} />
        </div>

        {/* --- (D) LAYOUT ATUALIZADO (VALOR E PRAZO LADO A LADO) --- */}
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="valorTotal" className="block text-sm font-medium text-gray-700">Valor Total (R$) <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    name="valorTotal" 
                    id="valorTotal" 
                    value={formData.valorTotal} 
                    onChange={handleChange} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                    placeholder="Ex: 15000,50"
                    required
                />
            </div>

            <div>
                <label htmlFor="prazoEmDias" className="block text-sm font-medium text-gray-700">Prazo (em dias) <span className="text-red-500">*</span></label>
                <input 
                    type="number" 
                    name="prazoEmDias" 
                    id="prazoEmDias" 
                    value={formData.prazoEmDias} 
                    onChange={handleChange} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                    placeholder="Ex: 30"
                    min="1"
                    required
                />
            </div>
        </div>

        {/* Descrição */}
        <div className="mb-6">
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea 
            name="descricao" 
            id="descricao" 
            rows={3}
            value={formData.descricao} 
            onChange={handleChange} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>

        {/* Botão de Envio */}
        <button 
          type="submit" 
          disabled={isLoading || !clienteId} 
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            'Salvar Projeto'
          )}
        </button>
        {!clienteId && !isLoading && (
             <p className="text-xs text-center text-red-500 mt-2">Selecione um cliente para habilitar o salvamento.</p>
        )}
      </form>
    </div>
  );
}