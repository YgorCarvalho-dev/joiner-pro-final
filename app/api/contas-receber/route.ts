// app/api/contas-receber/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Rota GET: Lista todas as contas a receber
export async function GET() {
  try {
    const contasReceber = await prisma.contaReceber.findMany({
      orderBy: {
        dataVencimento: 'asc',
      },
      include: {
        projeto: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return NextResponse.json(contasReceber, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar contas a receber:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao listar contas a receber." },
      { status: 500 }
    );
  }
}

// Rota POST: Cria uma nova conta a receber
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { descricao, valor, dataVencimento, projetoId } = body;

    if (!descricao || !valor || !dataVencimento) {
      return NextResponse.json({ message: "Descrição, valor e data de vencimento são obrigatórios." }, { status: 400 });
    }

    const novaConta = await prisma.contaReceber.create({
      data: {
        descricao,
        valor: parseFloat(valor),
        dataVencimento: new Date(dataVencimento),
        projetoId: projetoId || null,
      },
    });

    return NextResponse.json(novaConta, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar conta a receber:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao criar conta a receber." },
      { status: 500 }
    );
  }
}

// Rota PUT: Marca uma conta como recebida
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: "ID da conta é obrigatório." }, { status: 400 });
    }

    const contaAtualizada = await prisma.contaReceber.update({
      where: { id },
      data: {
        status: 'RECEBIDO',
        dataPagamento: new Date(),
      },
    });

    return NextResponse.json(contaAtualizada, { status: 200 });
  } catch (error) {
    console.error("Erro ao marcar conta como recebida:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao atualizar conta a receber." },
      { status: 500 }
    );
  }
}