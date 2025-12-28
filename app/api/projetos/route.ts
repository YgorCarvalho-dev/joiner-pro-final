import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Importa nosso cliente Prisma configurado

/**
 * Função auxiliar para converter string (BR) para float.
 */
const parsePtBrFloat = (value: any): number => {
    if (!value) return 0;
    const stringValue = String(value).replace(/\./g, '').replace(/,/g, '.');
    const numberValue = parseFloat(stringValue);
    return isNaN(numberValue) ? 0 : numberValue;
};

// Rota GET para listar todos os projetos (EXISTENTE E CORRETA)
export async function GET() {
  try {
    const projetos = await prisma.projeto.findMany({
        orderBy: {
            criadoEm: 'desc'
        },
        include: {
            cliente: true // Inclui o cliente na listagem
        }
    });
    return NextResponse.json(projetos, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar projetos (GET):", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao listar projetos." }, 
      { status: 500 }
    );
  }
}

// Rota POST (Criar Novo Projeto) - ATUALIZADA
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Recebe os dados (agora com prazoEmDias)
    const { nome, clienteId, valorTotal: valorString, descricao, prazoEmDias } = body; 

    // 2. Validação de dados essenciais
    if (!nome || !clienteId || !valorString) {
        return NextResponse.json({ message: "Nome, Cliente e Valor Total são obrigatórios." }, { status: 400 });
    }

    // 3. Tratamento dos valores numéricos
    const valorNumerico = parsePtBrFloat(valorString);
    // Converte o prazo para Int, com um padrão de 30 dias se for inválido
    const prazoNumerico = parseInt(String(prazoEmDias), 10) || 30; 

    // 4. Cria o novo projeto no MySQL via Prisma
    const novoProjeto = await prisma.projeto.create({
      data: {
        nome,
        valorTotal: valorNumerico, 
        descricao,
        status: 'ORCAMENTO', 
        clienteId: clienteId, 
        prazoEmDias: prazoNumerico, // <-- (A) SALVA O PRAZO
        // dataInicioProducao fica NULO (só é setado no PATCH)
      },
    });

    // 5. Retorna o projeto criado
    return NextResponse.json(novoProjeto, { status: 201 });

  } catch (error: any) {
    console.error("Erro ao criar projeto:", error);
    if (error.code === 'P2003') {
         return NextResponse.json(
            { message: "Erro de integridade: O Cliente selecionado não existe mais no banco de dados." }, 
            { status: 400 }
         );
    }
    
    return NextResponse.json(
      { message: "Falha ao salvar o projeto no banco de dados.", error: error.message }, 
      { status: 500 }
    );
  }
}