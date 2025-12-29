// app/api/relatorios/estoque/export/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const insumos = await prisma.insumo.findMany({
      include: { categoria: true },
      orderBy: { nome: 'asc' },
    });

    // Formatar dados para Excel
    const data = insumos.map(insumo => ({
      Nome: insumo.nome,
      Categoria: insumo.categoria.nome,
      Descrição: insumo.descricao || '',
      'Unidade de Medida': insumo.unidadeMedida,
      'Estoque Atual': insumo.estoqueAtual,
      'Estoque Mínimo': insumo.estoqueMinimo,
      'Preço de Custo': insumo.precoCusto,
      'Valor Total em Estoque': insumo.estoqueAtual * insumo.precoCusto,
      Status: insumo.estoqueAtual <= insumo.estoqueMinimo ? 'Baixo Estoque' : 'OK',
    }));

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 30 }, // Nome
      { wch: 20 }, // Categoria
      { wch: 40 }, // Descrição
      { wch: 15 }, // Unidade
      { wch: 15 }, // Estoque Atual
      { wch: 15 }, // Estoque Mínimo
      { wch: 15 }, // Preço
      { wch: 20 }, // Valor Total
      { wch: 15 }, // Status
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Estoque');

    // Gerar buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Retornar como resposta
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=relatorio_estoque.xlsx',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de estoque:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor ao gerar relatório.' },
      { status: 500 }
    );
  }
}