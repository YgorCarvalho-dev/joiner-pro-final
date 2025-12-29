// app/api/relatorios/projetos/export/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const projetos = await prisma.projeto.findMany({
      orderBy: { criadoEm: 'desc' },
      include: { cliente: true },
    });

    // Formatar dados para Excel
    const data = projetos.map(projeto => ({
      Nome: projeto.nome,
      Cliente: projeto.cliente.nome,
      'Valor Total': projeto.valorTotal,
      Status: projeto.status,
      'Prazo (dias)': projeto.prazoEmDias,
      'Data de Início': projeto.dataInicioProducao ? new Date(projeto.dataInicioProducao).toLocaleDateString('pt-BR') : '',
      Descrição: projeto.descricao || '',
      'Data de Cadastro': new Date(projeto.criadoEm).toLocaleDateString('pt-BR'),
    }));

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 30 }, // Nome
      { wch: 25 }, // Cliente
      { wch: 15 }, // Valor
      { wch: 15 }, // Status
      { wch: 12 }, // Prazo
      { wch: 15 }, // Data Início
      { wch: 40 }, // Descrição
      { wch: 15 }, // Data Cadastro
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Projetos');

    // Gerar buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Retornar como resposta
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=relatorio_projetos.xlsx',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de projetos:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor ao gerar relatório.' },
      { status: 500 }
    );
  }
}