// components/EstoqueDashboard.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, ArrowLeft, FolderOpen, AlertTriangle } from 'lucide-react';

// Reutilizando as tipagens
interface Categoria {
  id: string;
  nome: string;
}
interface Insumo {
  id: string;
  nome: string;
  unidadeMedida: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  precoCusto: number;
  categoria: Categoria;
}

interface Props {
  insumosIniciais: Insumo[];
}

export default function EstoqueDashboard({ insumosIniciais }: Props) {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);

  // 1. Agrupar os insumos por categoria dinamicamente
  const grupos = insumosIniciais.reduce((acc, item) => {
    const catId = item.categoria.id;
    if (!acc[catId]) {
      acc[catId] = {
        info: item.categoria,
        itens: [],
        totalItens: 0,
        alertas: 0
      };
    }
    acc[catId].itens.push(item);
    acc[catId].totalItens += 1;
    if (item.estoqueAtual <= item.estoqueMinimo) {
      acc[catId].alertas += 1;
    }
    return acc;
  }, {} as Record<string, { info: Categoria, itens: Insumo[], totalItens: number, alertas: number }>);

  const listaCategorias = Object.values(grupos);

  // --- MODO 1: VISUALIZAÇÃO DOS ITENS DA CATEGORIA (TABELA) ---
  if (categoriaSelecionada) {
    const dadosCategoria = grupos[categoriaSelecionada];
    
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setCategoriaSelecionada(null)}
            className="flex items-center text-gray-600 hover:text-blue-600 transition bg-white px-4 py-2 rounded-lg shadow-sm border"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar para Categorias
          </button>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FolderOpen className="w-6 h-6 mr-2 text-blue-600" />
            {dadosCategoria.info.nome}
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insumo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unid.</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Custo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dadosCategoria.itens.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 transition ${item.estoqueAtual <= item.estoqueMinimo ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                    {item.estoqueAtual <= item.estoqueMinimo && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {item.nome}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${item.estoqueAtual <= item.estoqueMinimo ? 'text-red-600' : 'text-gray-700'}`}>
                    {item.estoqueAtual}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unidadeMedida}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.precoCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/estoque/${item.id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- MODO 2: VISUALIZAÇÃO DOS CARDS (CATEGORIAS) ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {listaCategorias.map((grupo) => (
        <button
          key={grupo.info.id}
          onClick={() => setCategoriaSelecionada(grupo.info.id)}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left group relative overflow-hidden"
        >
          {/* Efeito de fundo ao passar o mouse */}
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Package className="w-24 h-24 text-blue-600" />
          </div>

          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <FolderOpen className="w-8 h-8 text-blue-600" />
            </div>
            {grupo.alertas > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle size={12} />
                {grupo.alertas} baixo estoque
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
            {grupo.info.nome}
          </h3>
          <p className="text-sm text-gray-500">
            {grupo.totalItens} itens cadastrados
          </p>
        </button>
      ))}

      {listaCategorias.length === 0 && (
        <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">Nenhum insumo encontrado.</p>
          <Link href="/estoque/categorias" className="text-blue-600 font-semibold hover:underline mt-2 inline-block">
            Criar categorias
          </Link>
        </div>
      )}
    </div>
  );
}