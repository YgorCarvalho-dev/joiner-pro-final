'use client'; // Esta é uma página de gerenciamento, 'use client' é ideal

import React, { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr'; // Usamos SWR para carregar dados do cliente
import { ArrowLeft, Plus, Loader2, Tag, Trash2, AlertTriangle } from 'lucide-react';
// --- (1) IMPORTAR O MODAL ---
import { Modal } from '@/components/Modal'; // Importa o modal que criamos

// Tipagem da Categoria
interface Categoria {
  id: string;
  nome: string;
}

// Fetcher (Buscador de dados) para o SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CategoriasPage() {
  const [novoNome, setNovoNome] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading do CREATE
  const [error, setError] = useState<string | null>(null); // Erro (para Create ou Delete)

  // --- (2) ESTADOS PARA O MODAL DE EXCLUSÃO ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Loading do DELETE
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);

  // Hook SWR: Busca dados da API e revalida automaticamente
  const { data: categorias, error: swrError, mutate } = useSWR<Categoria[]>('/api/estoque/categorias', fetcher);

  // Função para ADICIONAR nova categoria (Existente)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/estoque/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoNome }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Falha ao salvar categoria.');
      }

      setNovoNome(''); // Limpa o input
      mutate(); // Diz ao SWR para buscar os dados novamente (atualiza a lista!)

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- (3) FUNÇÃO PARA ABRIR O MODAL ---
  // Guarda a categoria selecionada e abre o modal
  const openDeleteModal = (categoria: Categoria) => {
    setSelectedCategoria(categoria); 
    setIsModalOpen(true);
    setError(null); // Limpa erros antigos
  };

  // --- (4) FUNÇÃO CHAMADA PELO MODAL PARA DELETAR ---
  const handleDeleteConfirm = async () => {
    if (!selectedCategoria) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Chama a nova API DELETE que criamos
      const res = await fetch(`/api/estoque/categorias/${selectedCategoria.id}`, {
        method: 'DELETE',
      });

      if (res.status === 204) { // Sucesso (No Content)
        mutate(); // Atualiza a lista SWR
      } else {
        const data = await res.json();
        // A API retorna o erro (ex: "Categoria em uso")
        throw new Error(data.message || 'Falha ao deletar categoria.'); 
      }

    } catch (err: any) {
      setError(err.message); // Mostra o erro na tela
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
      setSelectedCategoria(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Tag className="w-8 h-8 mr-3" />
          Gerenciar Categorias de Estoque
        </h1>
        <Link 
          href="/estoque"
          className="flex items-center text-blue-600 hover:text-blue-800 transition duration-150"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Estoque
        </Link>
      </div>

      {/* Formulário de Adição (Lado Esquerdo) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Nova Categoria</h2>
            {/* --- (5) MOSTRA ERRO (DE CREATE OU DELETE) AQUI --- */}
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                <AlertTriangle className="w-4 h-4 inline-block mr-2" />
                {error}
              </div>
            )}
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome da Categoria
            </label>
            <input 
              type="text" 
              id="nome" 
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Chapas 18mm"
            />
            <button
              type="submit"
              disabled={isLoading || isDeleting} // Desativa se estiver deletando também
              className="mt-4 w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              Adicionar
            </button>
          </form>
        </div>

        {/* Lista de Categorias (Lado Direito) */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Categorias Existentes</h2>
            
            {swrError && (
              <div className="flex items-center text-red-600 bg-red-50 p-3 rounded border border-red-300">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Erro ao carregar categorias.
              </div>
            )}
            {!categorias && !swrError && (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            )}

            <ul className="divide-y divide-gray-200">
              {categorias && categorias.length > 0 ? (
                categorias.map((cat) => (
                  <li key={cat.id} className="py-3 flex justify-between items-center">
                    <span className="text-gray-700">{cat.nome}</span>
                    <button 
                      onClick={() => openDeleteModal(cat)} // <-- (6) CHAMA O MODAL
                      disabled={isDeleting && selectedCategoria?.id === cat.id}
                      className="text-gray-400 hover:text-red-600 disabled:opacity-30"
                    >
                      {/* Mostra loading individual no item sendo deletado */}
                      {isDeleting && selectedCategoria?.id === cat.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </li>
                ))
              ) : (
                !swrError && <p className="text-gray-500 text-sm">Nenhuma categoria cadastrada.</p>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* --- (7) RENDERIZA O MODAL (fica invisível até ser aberto) --- */}
      {selectedCategoria && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Confirmar Exclusão"
          confirmText="Sim, Deletar"
          cancelText="Cancelar"
        >
          Tem certeza que deseja DELETAR a categoria: <strong>{selectedCategoria.nome}</strong>?
          <br />
          {/* Adiciona um aviso sobre a API que criamos */}
          <span className="text-sm text-gray-500 mt-2">
            Nota: A exclusão falhará se houver insumos cadastrados nesta categoria.
          </span>
        </Modal>
      )}
    </div>
  );
}