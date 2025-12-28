import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 1. Definimos a tipagem correta para o Next.js novo
interface RouteProps {
    params: Promise<{ id: string }>;
}

// Rota GET para buscar um cliente específico pelo ID
// 2. Recebemos 'props' em vez de desestruturar direto
export async function GET(request: Request, props: RouteProps) {
    
    // 3. O segredo: aguardamos o params ser resolvido antes de pegar o ID
    const params = await props.params;
    const id = params.id;

    try {
        const cliente = await prisma.cliente.findUnique({
            where: { id },
            include: {
                projetos: { // Inclui os projetos associados a este cliente
                    orderBy: {
                        criadoEm: 'desc'
                    }
                }
            }
        });

        if (!cliente) {
            return NextResponse.json({ message: "Cliente não encontrado." }, { status: 404 });
        }

        return NextResponse.json(cliente, { status: 200 });

    } catch (error) {
        console.error(`Erro ao buscar cliente ID ${id}:`, error);
        return NextResponse.json(
            { message: "Erro interno do servidor." },
            { status: 500 }
        );
    }
}