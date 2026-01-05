// app/(main)/estoque/page.tsx
import React from 'react';
import Link from 'next/link';
import { Plus, Package, Layers } from 'lucide-react';
import { unstable_noStore } from 'next/cache';
import EstoqueDashboard from '@/components/EstoqueDashboard'; // <--- IMPORTANTE: Ajuste o caminho se necessário

export const dynamic = 'force-dynamic';

// --- Função de Busca (igual ao que você já tinha) ---
async function getInsumos() {
  unstable_noStore();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return [];

  try {
    const res = await fetch(`${baseUrl}/api/estoque`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function EstoquePage() {
  const insumos = await getInsumos();

  return (
    <div>
      {/* Cabeçalho Fixo */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Package className="w-8 h-8 mr-3 text-gray-700" />
            Gestão de Estoque
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-11">Selecione uma categoria para ver os itens</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <Link 
              href="/estoque/categorias"
              className="flex-1 md:flex-none justify-center flex items-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition shadow-sm"
            >
                <Layers className="w-4 h-4 mr-2" />
                Categorias
            </Link>
            <Link 
              href="/estoque/novo"
              className="flex-1 md:flex-none justify-center flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition shadow-md"
            >
                <Plus className="w-5 h-5 mr-2" />
                Novo Insumo
            </Link>
        </div>
      </div>
      
      {/* Componente Interativo (Cards -> Tabela) */}
      <EstoqueDashboard insumosIniciais={insumos} />

    </div>
  );
}