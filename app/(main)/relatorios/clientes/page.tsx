// app/(main)/relatorios/clientes/page.tsx

import React from 'react';
import { ArrowLeft, Users, Mail, Phone, MapPin, Download } from 'lucide-react';
import { unstable_noStore } from 'next/cache';
import Link from 'next/link';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  endereco: string | null;
  criadoEm: string;
  _count: {
    projetos: number;
  };
}

async function getClientes(): Promise<Cliente[]> {
  unstable_noStore();
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/clientes`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Falha ao buscar clientes');
  return res.json();
}

export default async function RelatorioClientesPage() {
  let clientes: Cliente[] = [];
  let error: string | null = null;

  try {
    clientes = await getClientes();
  } catch (e) {
    error = (e as Error).message;
    console.error(e);
  }

  if (error) {
    return (
      <div className="p-6">
        <Link href="/relatorios" className="text-blue-500 hover:underline flex items-center gap-2 mb-4">
          <ArrowLeft size={16} />
          Voltar aos Relatórios
        </Link>
        <p className="text-red-500">Erro: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link href="/relatorios" className="text-blue-500 hover:underline flex items-center gap-2 mb-4">
        <ArrowLeft size={16} />
        Voltar aos Relatórios
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Users size={24} className="text-blue-500" />
        <h1 className="text-2xl font-bold">Relatório de Clientes</h1>
        <a
          href="/api/relatorios/clientes/export"
          className="ml-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
        >
          <Download size={16} />
          Exportar Excel
        </a>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b">
          <p className="text-gray-600">Total de clientes: {clientes.length}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Telefone</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Endereço</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Projetos</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{cliente.nome}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {cliente.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {cliente.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        {cliente.telefone}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {cliente.endereco && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        {cliente.endereco}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{cliente._count.projetos}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(cliente.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clientes.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Nenhum cliente cadastrado.
          </div>
        )}
      </div>
    </div>
  );
}