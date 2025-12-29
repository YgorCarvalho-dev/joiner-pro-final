// app/api/relatorios/financeiro/export/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const [contasPagar, contasReceber] = await Promise.all([
      prisma.contaPagar.findMany({ orderBy: { dataVencimento: 'asc' } }),
      prisma.contaReceber.findMany({
        orderBy: { dataVencimento: 'asc' },
        include: { projeto: { select: { nome: true } } },
      }),
    ]);

    // Formatar Contas a Pagar
    const dataPagar = contasPagar.map(conta => ({
      Descrição: conta.descricao,
      Valor: conta.valor,
      'Data de Vencimento': new Date(conta.dataVencimento).toLocaleDateString('pt-BR'),
      'Data de Pagamento': conta.dataPagamento ? new Date(conta.dataPagamento).toLocaleDateString('pt-BR') : '',
      Status: conta.status,
    }));

    // Formatar Contas a Receber
    const dataReceber = contasReceber.map(conta => ({
      Descrição: conta.descricao,
      Projeto: conta.projeto?.nome || '',
      Valor: conta.valor,
      'Data de Vencimento': new Date(conta.dataVencimento).toLocaleDateString('pt-BR'),
      'Data de Recebimento': conta.dataPagamento ? new Date(conta.dataPagamento).toLocaleDateString('pt-BR') : '',
      Status: conta.status,
    }));

    // Criar workbook
    const wb = XLSX.utils.book_new();

    // Adicionar sheet Contas a Pagar
    const wsPagar = XLSX.utils.json_to_sheet(dataPagar);
    const colWidthsPagar = [
      { wch: 40 }, // Descrição
      { wch: 15 }, // Valor
      { wch: 20 }, // Vencimento
      { wch: 20 }, // Pagamento
      { wch: 15 }, // Status
    ];
    wsPagar['!cols'] = colWidthsPagar;
    XLSX.utils.book_append_sheet(wb, wsPagar, 'Contas a Pagar');

    // Adicionar sheet Contas a Receber
    const wsReceber = XLSX.utils.json_to_sheet(dataReceber);
    const colWidthsReceber = [
      { wch: 40 }, // Descrição
      { wch: 25 }, // Projeto
      { wch: 15 }, // Valor
      { wch: 20 }, // Vencimento
      { wch: 20 }, // Recebimento
      { wch: 15 }, // Status
    ];
    wsReceber['!cols'] = colWidthsReceber;
    XLSX.utils.book_append_sheet(wb, wsReceber, 'Contas a Receber');

    // Gerar buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Retornar como resposta
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=relatorio_financeiro.xlsx',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório financeiro:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor ao gerar relatório.' },
      { status: 500 }
    );
  }
}