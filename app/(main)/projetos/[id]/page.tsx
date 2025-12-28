'use client'; 

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter, notFound } from 'next/navigation';
import { ArrowLeft, HardHat, DollarSign, Package, Edit, Save, X, Loader2, Trash2 } from 'lucide-react';
import useSWR from 'swr'; 
import { Modal } from '@/components/Modal'; 

// --- (1) IMPORTAR O NOVO COMPONENTE PCP ---
import PcpMateriais from '@/components/PcpMateriais';

// (Tipagem, Fetcher, EditForm... tudo permanece igual)
interface Cliente { id: string; nome: string; email: string | null; }
interface Projeto {
    id: string; nome: string; descricao: string | null; valorTotal: number;
    status: string; cliente: Cliente; criadoEm: string;
    prazoEmDias: number; // Adicionado para o EditForm
}
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (res.status === 404) notFound();
    if (!res.ok) throw new Error('Falha ao buscar detalhes do projeto.');
    return res.json();
};
interface EditFormProps {
    projeto: Projeto;
    setIsEditing: (isEditing: boolean) => void;
    onUpdateSuccess: () => void;
}

// --- Componente EditForm (Atualizado para incluir 'prazoEmDias') ---
const EditForm = ({ projeto, setIsEditing, onUpdateSuccess }: EditFormProps) => {
    const [formData, setFormData] = useState({
        nome: projeto.nome,
        valorTotal: String(projeto.valorTotal).replace('.', ','), 
        descricao: projeto.descricao || '',
        status: projeto.status,
        prazoEmDias: String(projeto.prazoEmDias || 30), // Adiciona o prazo ao form
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const statusOptions = ['ORCAMENTO', 'EM_PRODUCAO', 'CONCLUIDO', 'CANCELADO'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const valorTratado = formData.valorTotal.replace(/\./g, '').replace(/,/g, '.');
        const valorNumerico = parseFloat(valorTratado);
        if (isNaN(valorNumerico)) {
            setError('Valor Total inválido. Use apenas números.');
            setIsLoading(false);
            return;
        }
        try {
            const res = await fetch(`/api/projetos/${projeto.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                // Envia todos os dados do formulário (incluindo o prazo)
                body: JSON.stringify({ ...formData, valorTotal: valorNumerico }), 
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Falha ao atualizar o projeto.');
            }
            setIsEditing(false);
            onUpdateSuccess(); 
        } catch (err: any) {
            setError(err.message || 'Erro de rede ou servidor.');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <form onSubmit={handleUpdate} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Editar Projeto</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            
            {/* Nome e Status */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome do Projeto</label>
                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                        {statusOptions.map(s => (<option key={s} value={s}>{s.replace('_', ' ')}</option>))}
                    </select>
                </div>
            </div>
            
            {/* Valor, Prazo e Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Valor Total (R$)</label>
                    <input type="text" name="valorTotal" value={formData.valorTotal} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Prazo (em dias)</label>
                    <input type="number" name="prazoEmDias" value={formData.prazoEmDias} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cliente</label>
                    <input type="text" value={projeto.cliente.nome} disabled className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
            </div>
            
            {/* Descrição */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea name="descricao" rows={3} value={formData.descricao} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            
            {/* Botões */}
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setIsEditing(false)} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                </button>
                <button type="submit" disabled={isLoading} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar Alterações
                </button>
            </div>
        </form>
    );
};
// --- FIM DO EDITFORM ---


// -- Componente Principal (Detalhes do Projeto) --
function ProjetoDetalhesPage(props: { params: Promise<{ id: string }> }) { 
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // --- (2) ESTADO PARA CONTROLAR A ABA ATIVA ---
    const [activeTab, setActiveTab] = useState('Geral');
    
    const params = use(props.params);
    const { id: projetoId } = params; // Renomeia 'id' para 'projetoId' para clareza
    
    // SWR busca o projeto (incluindo o cliente, graças à API)
    const { data: projeto, error: fetchError, isLoading, mutate } = useSWR<Projeto>(
        `/api/projetos/${projetoId}`, 
        fetcher,
        { revalidateOnFocus: true }
    );
    
    const handleUpdateSuccess = () => {
        mutate(); // Revalida os dados do SWR
    };
    
    const handleDeleteConfirm = async () => {
        setIsDeleteModalOpen(false); 
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const res = await fetch(`/api/projetos/${projetoId}`, { method: 'DELETE' });
            if (res.status === 204) {
                router.push('/projetos');
                return;
            }
            const data = await res.json();
            throw new Error(data.message || "Falha ao deletar o projeto.");
        } catch (err: any) {
            setDeleteError(err.message);
        } finally {
            setIsDeleting(false);
        }
    };
    
    if (isLoading) return <div className="text-center p-10"><Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" /> Carregando Projeto...</div>;
    if (fetchError) return <div className="text-center p-10 text-red-600">Erro ao carregar: {fetchError.message}</div>;
    if (!projeto) return null; 

    // Se estiver em modo de edição, renderiza o formulário
    if (isEditing) {
        return <EditForm projeto={projeto} setIsEditing={setIsEditing} onUpdateSuccess={handleUpdateSuccess} />;
    }

    // Se não estiver em edição, renderiza a visualização
    const tabs = ['Geral', 'Materiais (MRP)', 'Financeiro', 'Produção (OS)'];

    return (
        <div>
            {deleteError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline"><strong>Erro ao deletar:</strong> {deleteError}</span>
                </div>
            )}

            {/* Cabeçalho */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <Link href="/projetos" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Todos os Projetos
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">{projeto.nome}</h1>
                    <p className="text-gray-500">Cliente: {projeto.cliente.nome} ({projeto.cliente.email || 'N/A'})</p>
                </div>
                <div className="flex space-x-3">
                    <span className={`px-4 py-1 text-sm font-semibold rounded-full 
                        ${projeto.status === 'EM_PRODUCAO' ? 'bg-yellow-100 text-yellow-800' : 
                          projeto.status === 'ORCAMENTO' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'}`}>
                        Status: {projeto.status.replace('_', ' ')}
                    </span>
                    <button onClick={() => setIsEditing(true)} disabled={isDeleting} className="flex items-center px-3 py-1 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition duration-150 disabled:opacity-50">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                    </button>
                    <button 
                        onClick={() => setIsDeleteModalOpen(true)} 
                        disabled={isDeleting} 
                        className="flex items-center px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-150 disabled:opacity-50"
                    >
                        {isDeleting ? (<Loader2 className="w-4 h-4 mr-1 animate-spin" />) : (<Trash2 className="w-4 h-4 mr-1" />)}
                        Deletar
                    </button>
                </div>
            </div>

            {/* Abas de Gerenciamento */}
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 mt-6">Gerenciamento do Projeto</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* --- (3) LÓGICA DAS ABAS ATUALIZADA --- */}
                <div className="flex border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-4 font-medium transition duration-150 border-b-2
                                ${activeTab === tab 
                                    ? 'text-blue-600 border-blue-600' 
                                    : 'text-gray-500 hover:text-gray-700 border-transparent'
                                }
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                
                {/* --- (4) CONTEÚDO DA ABA --- */}
                <div className="pt-6 text-gray-600">
                    {activeTab === 'Geral' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Informações Gerais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <Card icon={<DollarSign className="w-6 h-6 text-green-500" />} title="Valor Total" value={projeto.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                                <Card 
                                    icon={<HardHat className="w-6 h-6 text-orange-500" />} 
                                    title="Cliente" 
                                    value={projeto.cliente.nome} 
                                    href={`/clientes/${projeto.cliente.id}`}
                                />
                                <Card icon={<Package className="w-6 h-6 text-purple-500" />} title="Data de Criação" value={new Date(projeto.criadoEm).toLocaleDateString('pt-BR')} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Descrição</h3>
                            <p>{projeto.descricao || 'Nenhuma descrição fornecida.'}</p>
                        </div>
                    )}
                    
                    {/* --- (5) RENDERIZA O COMPONENTE PCP NA ABA --- */}
                    {activeTab === 'Materiais (MRP)' && (
                        <PcpMateriais projetoId={projetoId} />
                    )}

                    {activeTab === 'Financeiro' && (
                        <p>Funcionalidade "Financeiro" (Contas a Pagar/Receber) ainda não implementada.</p>
                    )}
                    
                    {activeTab === 'Produção (OS)' && (
                        <p>Funcionalidade "Produção (OS)" (Ordens de Serviço/Etapas) ainda não implementada.</p>
                    )}
                </div>
            </div>

            {/* Modal de Confirmação de Exclusão */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirmar Exclusão"
                confirmText="Sim, Deletar Projeto"
                cancelText="Cancelar"
            >
                Tem certeza que deseja DELETAR este projeto? Esta ação é irreversível.
            </Modal>
        </div>
    );
}

// Componente auxiliar para os cards (com href)
const Card = ({ icon, title, value, href }: { 
    icon: React.ReactNode, 
    title: string, 
    value: string,
    href?: string 
}) => {
    const cardContent = (
        <div className="flex items-center">
            <div className="mr-4 p-3 bg-gray-100 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
    if (href) {
        return (
            <Link href={href} className="block bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-300 hover:bg-gray-50 hover:shadow-lg transition duration-150">
                {cardContent}
            </Link>
        );
    }
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center border-l-4 border-gray-300">
            {cardContent}
        </div>
    );
};

// O export default (corrigido)
export default function SWRWrapper(props: { params: Promise<{ id: string }> }) {
    return <ProjetoDetalhesPage {...props} />;
}