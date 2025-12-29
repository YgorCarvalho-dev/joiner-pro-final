// import { auth } from "@/auth"
// import { NextResponse } from "next/server"

// Temporariamente desabilitado para debug
// export default auth((req) => {
//   const isAuth = !!req.auth
//   const isAuthPage = req.nextUrl.pathname.startsWith('/login')
//   const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')

//   if (isApiAuthRoute) {
//     return NextResponse.next()
//   }

//   if (isAuthPage) {
//     if (isAuth) {
//       return NextResponse.redirect(new URL('/', req.url))
//     }
//     return NextResponse.next()
//   }

//   if (!isAuth) {
//     let from = req.nextUrl.pathname;
//     if (req.nextUrl.search) {
//       from += req.nextUrl.search;
//     }

//     return NextResponse.redirect(
//       new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
//     );
//   }

//   return NextResponse.next()
// })

// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
// }

export default function middleware() {
  // Middleware desabilitado temporariamente
  return
}

export const config = {
  matcher: [],
}