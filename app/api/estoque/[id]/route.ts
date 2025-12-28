import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Tipagem para os parâmetros da rota
interface Params {
    params: { id: string };
}

/**
 * Função auxiliar para converter string (BR) para float.
 * Retorna 'undefined' se o valor for nulo/vazio, para que o Prisma não atualize o campo.
 */
const parsePtBrFloat = (value: any): number | undefined => {
    if (value === undefined || value === null || value === '') return undefined;
    
    // Converte '10,50' para '10.50' ou '1.000,50' para '1000.50'
    const stringValue = String(value).replace(/\./g, '').replace(/,/g, '.');
    const numberValue = parseFloat(stringValue);
    
    return isNaN(numberValue) ? undefined : numberValue;
};

/**
 * Rota GET: Busca um insumo específico pelo ID
 */
export async function GET(request: Request, { params }: Params) {
    // Resolve o bug de "params é uma Promise"
    const { id } = await Promise.resolve(params); 

    try {
        const insumo = await prisma.insumo.findUnique({
            where: { id },
            include: {
                categoria: true, // Inclui a categoria (para o select do formulário)
            },
        });

        if (!insumo) {
            return NextResponse.json({ message: "Insumo não encontrado." }, { status: 404 });
        }

        return NextResponse.json(insumo, { status: 200 });

    } catch (error) {
        console.error(`Erro ao buscar insumo ID ${id}:`, error);
        return NextResponse.json(
            { message: "Erro interno do servidor." },
            { status: 500 }
        );
    }
}

/**
 * Rota PATCH: Atualiza um insumo existente
 */
export async function PATCH(request: Request, { params }: Params) {
    const { id } = await Promise.resolve(params); // Resolve a promise
    
    try {
        const body = await request.json();
        const { 
            nome, 
            descricao, 
            unidadeMedida, 
            categoriaId,
            estoqueAtual,
            estoqueMinimo,
            precoCusto
        } = body;

        // Prepara os dados de atualização, convertendo números
        // O Prisma ignora campos 'undefined', então ele só atualiza o que foi passado
        const dataToUpdate = {
            nome,
            descricao,
            unidadeMedida,
            categoriaId,
            estoqueAtual: parsePtBrFloat(estoqueAtual),
            estoqueMinimo: parsePtBrFloat(estoqueMinimo),
            precoCusto: parsePtBrFloat(precoCusto),
        };

        const insumoAtualizado = await prisma.insumo.update({
            where: { id },
            data: dataToUpdate,
        });

        return NextResponse.json(insumoAtualizado, { status: 200 });

    } catch (error: any) {
        console.error(`Erro ao atualizar insumo ID ${id}:`, error);
        return NextResponse.json(
            { message: "Falha ao atualizar o insumo.", error: error.message },
            { status: 500 }
        );
    }
}

/**
 * Rota DELETE: Exclui um insumo
 */
export async function DELETE(request: Request, { params }: Params) {
    const { id } = await Promise.resolve(params); // Resolve a promise

    try {
        await prisma.insumo.delete({
            where: { id }
        });

        // 204: Sucesso, sem conteúdo
        return new NextResponse(null, { status: 204 }); 

    } catch (error: any) {
        console.error(`Erro ao deletar insumo ID ${id}:`, error);

        if (error.code === 'P2025') { // Erro do Prisma (Registro não encontrado)
            return NextResponse.json({ message: "Insumo não encontrado para exclusão." }, { status: 404 });
        }
        
        // (Futuramente, verificar se o insumo está em uso por um Projeto antes de deletar)

        return NextResponse.json(
            { message: "Falha ao deletar o insumo.", error: error.message },
            { status: 500 }
        );
    }
}