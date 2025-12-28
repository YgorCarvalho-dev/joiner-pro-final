import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
    params: { id: string };
}

/**
 * Rota DELETE: Exclui uma categoria de estoque
 */
export async function DELETE(request: Request, { params }: Params) {
    // Resolve o bug de "params é uma Promise"
    const { id } = await Promise.resolve(params);

    try {
        // Tenta deletar a categoria
        await prisma.categoriaEstoque.delete({
            where: { id }
        });

        // Retorna uma resposta de sucesso sem conteúdo (Padrão 204)
        return new NextResponse(null, { status: 204 }); 

    } catch (error: any) {
        console.error(`Erro ao deletar categoria ID ${id}:`, error);

        // --- TRATAMENTO DE ERRO IMPORTANTE ---
        // Se o erro for P2003 (Foreign key constraint violation)...
        // Isso significa que o usuário tentou deletar uma Categoria
        // que AINDA POSSUI INSUMOS ligados a ela.
        if (error.code === 'P2003') {
            return NextResponse.json(
              { message: "Esta categoria não pode ser excluída, pois existem insumos cadastrados nela. Remova os insumos primeiro." },
              { status: 409 } // 409: Conflict
            );
        }

        if (error.code === 'P2025') { // Erro do Prisma (Registro não encontrado)
            return NextResponse.json({ message: "Categoria não encontrada para exclusão." }, { status: 404 });
        }

        return NextResponse.json(
            { message: "Falha ao deletar a categoria.", error: error.message },
            { status: 500 }
        );
    }
}