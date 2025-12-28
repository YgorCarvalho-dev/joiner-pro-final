import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Rota GET: Lista todas as categorias de estoque
 */
export async function GET() {
  try {
    const categorias = await prisma.categoriaEstoque.findMany({
      orderBy: {
        nome: 'asc',
      },
    });
    return NextResponse.json(categorias, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao buscar categorias." },
      { status: 500 }
    );
  }
}

/**
 * Rota POST: Cria uma nova categoria de estoque
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome } = body;

    if (!nome) {
      return NextResponse.json({ message: "O campo 'nome' é obrigatório." }, { status: 400 });
    }

    // Verifica se a categoria já existe (para evitar duplicatas)
    const categoriaExistente = await prisma.categoriaEstoque.findUnique({
      where: { nome },
    });

    if (categoriaExistente) {
      return NextResponse.json({ message: "Esta categoria já existe." }, { status: 409 }); // 409 Conflict
    }

    // Cria a nova categoria
    const novaCategoria = await prisma.categoriaEstoque.create({
      data: {
        nome,
      },
    });

    return NextResponse.json(novaCategoria, { status: 201 });

  } catch (error: any) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { message: "Falha ao salvar a categoria.", error: error.message },
      { status: 500 }
    );
  }
}