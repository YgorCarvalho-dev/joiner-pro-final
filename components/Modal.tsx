'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom'; // Importa o createPortal
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
}

/**
 * Um componente de modal de confirmação genérico que usa Portals.
 */
export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText = "Confirmar",
    cancelText = "Cancelar"
}) => {
    // Estado para garantir que o modal só seja renderizado no cliente
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Se não estiver aberto OU se não estivermos no cliente (para evitar erros de SSR), não renderiza nada
    if (!isOpen || !isClient) return null;

    // O conteúdo do modal que será "portalizado"
    const modalContent = (
        // Overlay (fundo escuro transparente)
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity"
            onClick={onClose} // Fecha ao clicar fora
        >
            {/* Conteúdo do Modal */}
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 transform transition-all"
                onClick={(e) => e.stopPropagation()} // Impede de fechar ao clicar dentro
            >
                {/* Cabeçalho */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="mr-3 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                            {title}
                        </h3>
                    </div>
                    <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={onClose}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Corpo (Mensagem) */}
                <div className="mb-6">
                    <p className="text-sm text-gray-500">
                        {children}
                    </p>
                </div>

                {/* Rodapé / Ações */}
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );

    // Usa o createPortal para renderizar o modalContent dentro do #modal-root
    // Usamos document.body como fallback caso o modal-root não seja encontrado imediatamente
    const modalRoot = document.getElementById('modal-root');
    return modalRoot ? createPortal(modalContent, modalRoot) : null;
};