// app/api/contas-pagar/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Rota GET: Lista todas as contas a pagar
export async function GET() {
  try {
    const contasPagar = await prisma.contaPagar.findMany({
      orderBy: {
        dataVencimento: 'asc',
      },
    });

    return NextResponse.json(contasPagar, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar contas a pagar:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao listar contas a pagar." },
      { status: 500 }
    );
  }
}

// Rota POST: Cria uma nova conta a pagar
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { descricao, valor, dataVencimento } = body;

    if (!descricao || !valor || !dataVencimento) {
      return NextResponse.json({ message: "Descrição, valor e data de vencimento são obrigatórios." }, { status: 400 });
    }

    const novaConta = await prisma.contaPagar.create({
      data: {
        descricao,
        valor: parseFloat(valor),
        dataVencimento: new Date(dataVencimento),
      },
    });

    return NextResponse.json(novaConta, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar conta a pagar:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao criar conta a pagar." },
      { status: 500 }
    );
  }
}

// Rota PUT: Marca uma conta como paga
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: "ID da conta é obrigatório." }, { status: 400 });
    }

    const contaAtualizada = await prisma.contaPagar.update({
      where: { id },
      data: {
        status: 'PAGO',
        dataPagamento: new Date(),
      },
    });

    return NextResponse.json(contaAtualizada, { status: 200 });
  } catch (error) {
    console.error("Erro ao marcar conta como paga:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao atualizar conta a pagar." },
      { status: 500 }
    );
  }
}