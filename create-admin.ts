import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  const username = process.argv[2]
  const password = process.argv[3]

  if (!username || !password) {
    console.log('Uso: npx ts-node create-admin.ts <username> <password>')
    process.exit(1)
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'ADMIN',
        ativo: true,
      },
    })

    console.log('Usuário administrador criado com sucesso!')
    console.log('Username:', user.username)
    console.log('Role:', user.role)
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()