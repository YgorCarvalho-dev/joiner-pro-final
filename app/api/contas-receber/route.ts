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

// Rota POST: Cria nova conta (Com lógica de parcelamento e Projeto)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { descricao, valor, dataVencimento, projetoId, parcelas, metodoPagamento } = body;

    if (!descricao || !valor || !dataVencimento) {
      return NextResponse.json({ message: "Dados obrigatórios faltando." }, { status: 400 });
    }

    const valorTotal = parseFloat(valor);
    const numParcelas = parseInt(parcelas) || 1;
    const dataBase = new Date(dataVencimento);
    
    // Tratamento do projetoId (pode vir vazio ou string vazia)
    const projetoConnect = projetoId ? { projetoId } : {};

    // --- CENÁRIO 1: RECEBIMENTO À VISTA (1x) ---
    // Já nasce RECEBIDO (Dinheiro no caixa)
    if (numParcelas === 1) {
      const novaConta = await prisma.contaReceber.create({
        data: {
          descricao: `${descricao} (À Vista - ${metodoPagamento || 'Dinheiro'})`,
          valor: valorTotal,
          dataVencimento: dataBase,
          status: 'RECEBIDO', // <--- Já entra como recebido
          dataPagamento: new Date(), // Data de hoje
          ...projetoConnect, // Vincula ao projeto se existir
        },
      });
      return NextResponse.json(novaConta, { status: 201 });
    }

    // --- CENÁRIO 2: PARCELADO (>1x) ---
    const operacoes = [];
    const valorParcela = valorTotal / numParcelas;

    for (let i = 0; i < numParcelas; i++) {
      // Calcula o vencimento (Mês Base + i)
      const dataParcela = new Date(dataBase);
      dataParcela.setMonth(dataParcela.getMonth() + i);

      const descricaoParcela = `${descricao} (${i + 1}/${numParcelas})`;

      operacoes.push(
        prisma.contaReceber.create({
          data: {
            descricao: descricaoParcela,
            valor: valorParcela,
            dataVencimento: dataParcela,
            status: 'PENDENTE', // Parcelas nascem pendentes
            dataPagamento: null,
            ...projetoConnect, // Todas as parcelas ficam vinculadas ao projeto
          }
        })
      );
    }

    // Executa tudo de uma vez
    await prisma.$transaction(operacoes);

    return NextResponse.json({ message: `${numParcelas} parcelas criadas com sucesso.` }, { status: 201 });

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