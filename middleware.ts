import { auth } from "@/auth" // Certifique-se que o caminho do seu auth.ts está correto
import { NextResponse } from "next/server"

export default auth((req) => {
  // Verifica se o usuário está logado
  const isLoggedIn = !!req.auth
  
  // Define as rotas
  const isOnLoginPage = req.nextUrl.pathname.startsWith('/login')
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')
  const isPublicRoute = req.nextUrl.pathname === '/cadastro' // Adicione outras rotas publicas aqui se tiver

  // 1. Se for rota de API de autenticação, deixa passar sempre
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // 2. Se estiver na página de login
  if (isOnLoginPage) {
    // Mas já estiver logado, manda para a home (dashboard)
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    // Se não estiver logado, deixa ficar na página de login
    return NextResponse.next()
  }

  // 3. Se não estiver logado e não for uma rota pública
  if (!isLoggedIn && !isPublicRoute) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    // Redireciona para o login salvando a url que ele tentou acessar
    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
    )
  }

  return NextResponse.next()
})

// Configuração para o middleware não rodar em arquivos estáticos ou imagens
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}