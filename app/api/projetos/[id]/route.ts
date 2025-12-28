import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
    params: { id: string };
}

/**
 * Função auxiliar para converter string (BR) para float.
 * Retorna 'undefined' se o valor for nulo/vazio.
 */
const parsePtBrFloat = (value: any): number | undefined => {
    if (value === undefined || value === null || value === '') return undefined;
    const stringValue = String(value).replace(/\./g, '').replace(/,/g, '.');
    const numberValue = parseFloat(stringValue);
    return isNaN(numberValue) ? undefined : numberValue;
};

// Rota GET (JÁ EXISTENTE, SEM MUDANÇAS)
export async function GET(request: Request, { params }: Params) {
    const { id } = await Promise.resolve(params); 
    try {
        const projeto = await prisma.projeto.findUnique({
            where: { id },
            include: { cliente: true }
        });
        if (!projeto) {
            return NextResponse.json({ message: "Projeto não encontrado." }, { status: 404 });
        }
        return NextResponse.json(projeto, { status: 200 });
    } catch (error) {
        console.error(`Erro ao buscar projeto ID ${id}:`, error);
        return NextResponse.json(
            { message: "Erro interno do servidor." },
            { status: 500 }
        );
    }
}

/**
 * Rota PATCH: Atualiza um projeto existente (COM LÓGICA DE PRAZO)
 */
export async function PATCH(request: Request, { params }: Params) {
    const { id } = await Promise.resolve(params); 
    
    try {
        const body = await request.json();
        const { nome, status, valorTotal, descricao, clienteId, prazoEmDias } = body;

        // Prepara os dados de atualização
        const dataToUpdate: any = {};
        
        // --- (A LÓGICA MÁGICA ESTÁ AQUI) ---
        // Se o status está sendo alterado...
        if (status) {
            dataToUpdate.status = status;
            
            // Verifica se o status NOVO é "EM_PRODUCAO"
            if (status === 'EM_PRODUCAO') {
                // 1. Busca o projeto ATUAL no banco
                const projetoAtual = await prisma.projeto.findUnique({
                    where: { id },
                    select: { status: true, dataInicioProducao: true }
                });

                // 2. Se o status antigo NÃO ERA "EM_PRODUCAO" (ou seja, está mudando agora)
                //    E se a data de início ainda não foi setada (garantia extra)
                if (projetoAtual && projetoAtual.status !== 'EM_PRODUCAO' && !projetoAtual.dataInicioProducao) {
                    // SETA A DATA DE INÍCIO DA PRODUÇÃO!
                    dataToUpdate.dataInicioProducao = new Date();
                }
            }
        }
        // --- FIM DA LÓGICA ---

        // Adiciona outros campos se eles foram enviados (undefined são ignorados pelo Prisma)
        if (nome !== undefined) dataToUpdate.nome = nome;
        if (descricao !== undefined) dataToUpdate.descricao = descricao;
        if (clienteId !== undefined) dataToUpdate.clienteId = clienteId;
        if (prazoEmDias !== undefined) dataToUpdate.prazoEmDias = parseInt(String(prazoEmDias), 10);
        
        // Trata o valor monetário (com vírgula/ponto)
        const valorNumerico = parsePtBrFloat(valorTotal);
        if (valorNumerico !== undefined) dataToUpdate.valorTotal = valorNumerico;

        // Atualiza o projeto
        const projetoAtualizado = await prisma.projeto.update({
            where: { id },
            data: dataToUpdate, // Atualiza apenas os campos enviados
        });

        return NextResponse.json(projetoAtualizado, { status: 200 });

    } catch (error: any) {
        console.error(`Erro ao atualizar projeto ID ${id}:`, error);
        return NextResponse.json(
            { message: "Falha ao atualizar o projeto.", error: error.message },
            { status: 500 }
        );
    }
}

// Rota DELETE (JÁ EXISTENTE, SEM MUDANÇAS)
export async function DELETE(request: Request, { params }: Params) {
    const { id } = await Promise.resolve(params);
    try {
        await prisma.projeto.delete({
            where: { id }
        });
        return new NextResponse(null, { status: 204 }); 
    } catch (error: any) {
        console.error(`Erro ao deletar projeto ID ${id}:`, error);
        if (error.code === 'P2003') { // Proteção de Foreign Key
            return NextResponse.json(
              { message: "Este projeto não pode ser excluído, pois possui insumos (PCP) ligados a ele." },
              { status: 409 } // Conflict
            );
        }
        if (error.code === 'P2025') { 
            return NextResponse.json({ message: "Projeto não encontrado para exclusão." }, { status: 404 });
        }
        return NextResponse.json(
            { message: "Falha ao deletar o projeto.", error: error.message },
            { status: 500 }
        );
    }
}