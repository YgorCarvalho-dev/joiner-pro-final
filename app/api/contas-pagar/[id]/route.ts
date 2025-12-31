import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteProps {
    params: Promise<{ id: string }>;
}

// BUSCAR UMA CONTA (GET)
export async function GET(request: Request, props: RouteProps) {
    const params = await props.params;
    const id = params.id;

    try {
        const conta = await prisma.contaPagar.findUnique({
            where: { id }
        });

        if (!conta) {
            return NextResponse.json({ message: "Conta não encontrada" }, { status: 404 });
        }

        return NextResponse.json(conta);
    } catch (error) {
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

// ATUALIZAR UMA CONTA (PATCH)
export async function PATCH(request: Request, props: RouteProps) {
    const params = await props.params;
    const id = params.id;
    
    try {
        const body = await request.json();
        
        // Removemos campos que não devem ser atualizados na marra (ex: id)
        const { id: _, ...dadosAtualizar } = body;

        const contaAtualizada = await prisma.contaPagar.update({
            where: { id },
            data: dadosAtualizar
        });

        return NextResponse.json(contaAtualizada);
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        return NextResponse.json({ message: "Erro ao atualizar conta" }, { status: 500 });
    }
}

// DELETAR UMA CONTA (DELETE)
export async function DELETE(request: Request, props: RouteProps) {
    const params = await props.params;
    const id = params.id;

    try {
        await prisma.contaPagar.delete({
            where: { id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao deletar conta" }, { status: 500 });
    }
}