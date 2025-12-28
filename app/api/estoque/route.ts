import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Rota GET: Lista todos os insumos (itens de estoque)
 * Inclui a categoria relacionada (Chapas, Ferragens, etc.)
 */
export async function GET() {
  try {
    const insumos = await prisma.insumo.findMany({
      // "include" faz o JOIN com a tabela de Categoria
      include: {
        categoria: true, 
      },
      orderBy: {
        nome: 'asc',
      },
    });
    return NextResponse.json(insumos, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar insumos:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao buscar insumos." },
      { status: 500 }
    );
  }
}

/**
 * Rota POST: Cria um novo insumo (item de estoque)
 * ESTA É A VERSÃO ATUALIZADA
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Recebe os dados do formulário
    const { 
        nome, 
        descricao,
        unidadeMedida, 
        categoriaId,
        // Recebe os nomes corretos do formulário
        estoqueAtual, 
        estoqueMinimo, 
        precoCusto 
    } = body;

    // 2. Validação básica de entrada
    if (!nome || !unidadeMedida || !categoriaId) {
      return NextResponse.json(
        { message: "Nome, Unidade de Medida e Categoria são obrigatórios." },
        { status: 400 }
      );
    }
    
    // 3. Tratamento dos valores numéricos (Função auxiliar para converter '10,50' ou '10' para 10.50 ou 10)
    const parsePtBrFloat = (value: any): number => {
        if (!value) return 0;
        const stringValue = String(value).replace(/\./g, '').replace(/,/g, '.');
        const numberValue = parseFloat(stringValue);
        return isNaN(numberValue) ? 0 : numberValue;
    };

    const estoqueAtualNum = parsePtBrFloat(estoqueAtual);
    const estoqueMinimoNum = parsePtBrFloat(estoqueMinimo);
    const precoCustoNum = parsePtBrFloat(precoCusto);

    // 4. Cria o insumo no banco de dados usando os nomes corretos do Schema
    const novoInsumo = await prisma.insumo.create({
      data: {
        nome,
        descricao,
        unidadeMedida,
        estoqueAtual: estoqueAtualNum,  // <-- Campo correto do schema
        estoqueMinimo: estoqueMinimoNum, // <-- Campo correto do schema
        precoCusto: precoCustoNum,    // <-- Campo correto do schema
        categoriaId, // Associa à categoria pelo ID
      },
    });

    return NextResponse.json(novoInsumo, { status: 201 }); // 201: Created

  } catch (error: any) {
    console.error("Erro ao criar insumo:", error);
    
    // Erro comum: Se a categoria (categoriaId) não existir
    if (error.code === 'P2003') {
      return NextResponse.json(
        { message: "Erro de integridade: A Categoria selecionada não existe." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Falha ao salvar o insumo no banco de dados.", error: error.message },
      { status: 500 }
    );
  }
}