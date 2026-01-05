import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
    params: { itemId: string }; // O 'id' aqui é o ID do PROJETO
}

/**
 * Rota GET: Lista todos os insumos (materiais) de UM projeto específico
 */
export async function GET(request: Request, { params }: Params) {
    const { itemId: projetoId } = await Promise.resolve(params); // Renomeia 'id' para 'projetoId'

    try {
        const materiais = await prisma.insumoDoProjeto.findMany({
            where: { projetoId: projetoId },
            // Inclui os dados do Insumo (Nome, Unidade, etc.)
            include: {
                insumo: true 
            },
            orderBy: {
                criadoEm: 'desc'
            }
        });

        return NextResponse.json(materiais, { status: 200 });

    } catch (error) {
        console.error(`Erro ao buscar materiais do projeto ${projetoId}:`, error);
        return NextResponse.json(
            { message: "Erro interno do servidor." },
            { status: 500 }
        );
    }
}


/**
 * Rota POST: Adiciona um novo insumo (material) a um projeto
 */
export async function POST(request: Request, { params }: Params) {
    const { itemId: projetoId } = await Promise.resolve(params); // ID do Projeto

    try {
        const body = await request.json();
        const { insumoId, quantidadeUsada } = body;

        if (!insumoId || !quantidadeUsada) {
            return NextResponse.json({ message: "Insumo e Quantidade são obrigatórios." }, { status: 400 });
        }
        
        const qtdNum = parseFloat(String(quantidadeUsada).replace(',', '.')) || 1;

        // Cria o registro na tabela de junção 'insumos_do_projeto'
        const novoMaterial = await prisma.insumoDoProjeto.create({
            data: {
                projetoId: projetoId,
                insumoId: insumoId,
                quantidadeUsada: qtdNum
            }
        });

        return NextResponse.json(novoMaterial, { status: 201 });

    } catch (error: any) {
        console.error(`Erro ao adicionar material ao projeto ${projetoId}:`, error);
         if (error.code === 'P2003') { // Foreign Key (Insumo ou Projeto não existem)
            return NextResponse.json(
              { message: "Erro de integridade: O Insumo ou Projeto selecionado não existe." },
              { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "Falha ao adicionar material.", error: error.message },
            { status: 500 }
        );
    }
}