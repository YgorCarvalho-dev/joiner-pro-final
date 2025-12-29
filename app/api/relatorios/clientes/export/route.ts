// app/api/relatorios/clientes/export/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: 'asc' },
      include: {
        _count: { select: { projetos: true } },
      },
    });

    // Formatar dados para Excel
    const data = clientes.map(cliente => ({
      Nome: cliente.nome,
      Email: cliente.email || '',
      Telefone: cliente.telefone || '',
      Endereço: cliente.endereco || '',
      'Projetos Associados': cliente._count.projetos,
      'Data de Cadastro': new Date(cliente.criadoEm).toLocaleDateString('pt-BR'),
    }));

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 30 }, // Nome
      { wch: 30 }, // Email
      { wch: 15 }, // Telefone
      { wch: 40 }, // Endereço
      { wch: 20 }, // Projetos
      { wch: 15 }, // Data
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

    // Gerar buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Retornar como resposta
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=relatorio_clientes.xlsx',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de clientes:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor ao gerar relatório.' },
      { status: 500 }
    );
  }
}