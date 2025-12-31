import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteProps {
    params: Promise<{ id: string }>;
}

// GET
export async function GET(request: Request, props: RouteProps) {
    const params = await props.params;
    const id = params.id;

    try {
        const conta = await prisma.contaReceber.findUnique({
            where: { id },
            include: { projeto: true } // Inclui dados do projeto se houver
        });

        if (!conta) {
            return NextResponse.json({ message: "Conta não encontrada" }, { status: 404 });
        }

        return NextResponse.json(conta);
    } catch (error) {
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

// PATCH
export async function PATCH(request: Request, props: RouteProps) {
    const params = await props.params;
    const id = params.id;
    
    try {
        const body = await request.json();
        const { id: _, ...dadosAtualizar } = body;

        const contaAtualizada = await prisma.contaReceber.update({
            where: { id },
            data: dadosAtualizar
        });

        return NextResponse.json(contaAtualizada);
    } catch (error) {
        return NextResponse.json({ message: "Erro ao atualizar conta" }, { status: 500 });
    }
}

// DELETE
export async function DELETE(request: Request, props: RouteProps) {
    const params = await props.params;
    const id = params.id;

    try {
        await prisma.contaReceber.delete({
            where: { id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao deletar conta" }, { status: 500 });
    }
}