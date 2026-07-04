// ═══════════════════════════════════════════════════════════════════
// Middleware de Next.js — Protección de rutas
// ═══════════════════════════════════════════════════════════════════
// Corre en Edge runtime. NO puede usar Prisma directamente.
//
// Responsabilidades:
//   1. Bloquear acceso de usuarios NO autenticados a rutas protegidas.
//   2. Permitir /onboarding/* y /seleccionar-tenant para usuarios
//      autenticados sin activeTenantId (evita bucle de redirección).
//
// La validación profunda (activeTenantId, roles, UserTenant) la hacen
// los Server Components y API handlers, que sí tienen acceso a la DB.
//
// Cookie de sesión NextAuth v5:
//   - Desarrollo:  authjs.session-token
//   - Producción:  __Secure-authjs.session-token
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'

// Rutas que pasan siempre, sin verificar cookie de sesión.
// Incluye: páginas de acceso público, el handler de Auth.js y las
// rutas de onboarding/selección de tenant.
//
// CRÍTICO — /api/auth/* debe estar aquí:
//   El callback de Google (/api/auth/callback/google) setea la cookie
//   en su respuesta. Si el middleware intercepta ese request antes de
//   que la cookie exista, bloquea el flujo de auth.
//
// CRÍTICO — /onboarding/* y /seleccionar-tenant deben estar aquí:
//   Después del callback, Auth.js redirige a /onboarding/codigo.
//   En ese redirect, el navegador envía el request con la cookie recién
//   seteada, pero el middleware la evalúa antes de que esté disponible
//   en el contexto Edge. Colocarlas aquí evita el bloqueo.
//   La validación real de sesión la hace el layout Server Component
//   vía auth() con acceso a DB.
const PUBLIC_PATHS = [
  '/login',
  '/registro',
  '/api/auth',
  '/api/vincular',
  '/onboarding',
  '/seleccionar-tenant',
  '/home',
  '/verify-request',
  '/auth',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 1. Rutas públicas / post-auth → pasan sin verificar cookie
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // ── 2. Verificar existencia de cookie de sesión (Edge-compatible)
  //       Cookie de NextAuth v5: authjs.session-token (dev)
  //                              __Secure-authjs.session-token (prod)
  const sessionToken =
    req.cookies.get('authjs.session-token')?.value ??
    req.cookies.get('__Secure-authjs.session-token')?.value

  if (!sessionToken) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    // No autenticado → redirigir al login conservando la URL original
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 3. Autenticado → permitir
  // La validación de activeTenantId la hace cada page/layout en Server Component
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto los assets estáticos de Next.js.
     * Incluye: páginas, API routes (excepto /api/auth que es pública arriba),
     * rutas de onboarding, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
