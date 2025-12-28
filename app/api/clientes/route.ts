// app/api/clientes/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Nosso cliente Prisma configurado

// Rota GET: Lista todos os clientes
export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: {
        nome: 'asc', // Ordena pelo nome
      },
      // Inclui a contagem de projetos para cada cliente (útil na listagem)
      include: {
        _count: {
          select: { projetos: true },
        },
      },
    });

    return NextResponse.json(clientes, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao listar clientes." },
      { status: 500 }
    );
  }
}

// Rota POST: Cria um novo cliente
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, telefone, endereco } = body;

    // 1. Validação básica (Nome e Email são obrigatórios no nosso Schema)
    if (!nome || !email) {
      return NextResponse.json({ message: "Nome e Email são obrigatórios." }, { status: 400 });
    }
    
    // 2. Criação do cliente no MySQL
    const novoCliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        telefone,
        endereco,
      },
    });

    return NextResponse.json(novoCliente, { status: 201 }); // 201: Created

  } catch (error: any) {
    // Trata erro de email duplicado (Constraint violation no Prisma)
    if (error.code === 'P2002' && error.meta?.target.includes('email')) {
      return NextResponse.json(
        { message: "Este e-mail já está cadastrado para outro cliente." },
        { status: 409 } // 409: Conflict
      );
    }
    
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { message: "Falha ao salvar o cliente no banco de dados.", error: error.message },
      { status: 500 }
    );
  }
}