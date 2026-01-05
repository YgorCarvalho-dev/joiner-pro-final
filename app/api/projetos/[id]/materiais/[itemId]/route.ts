// app/api/projetos/[id]/materiais/[itemId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

export async function DELETE(
  request: Request,
  // Agora desestruturamos 'itemId' porque renomeamos a pasta
  { params }: { params: { itemId: string } }
) {
  // Pegamos o ID específico do material (itemId)
  const { itemId } = await Promise.resolve(params);

  try {
    if (!itemId) {
        return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    // Apaga o registro usando o itemId
    await prisma.insumoDoProjeto.delete({
      where: {
        id: itemId,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erro ao deletar material:", error);
    return NextResponse.json(
      { error: "Erro ao remover material." },
      { status: 500 }
    );
  }
}