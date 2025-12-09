import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Get session to access JWT access token with custom claims
  const { data: { session } } = await supabase.auth.getSession()

  // Check role from JWT claims
  // Supabase merges JWT custom claims differently depending on client type
  // Custom claims from auth.jwt_custom_claims() are in the JWT payload
  // Try multiple locations where the role might be stored
  let role: string | undefined

  // First, try to decode the JWT access token to get custom claims
  if (session?.access_token) {
    try {
      const payload = JSON.parse(
        Buffer.from(session.access_token.split('.')[1], 'base64').toString()
      )
      role = payload.role
    } catch (e) {
      // JWT decode failed, continue to other checks
    }
  }

  // Fallback to user metadata locations
  role = role ??
    user.app_metadata?.role ??
    user.user_metadata?.role ??
    user.user_metadata?.claims?.role

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware role check:', {
      role,
      hasSession: !!session,
      userId: user.id,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata,
      jwtPayload: session?.access_token
        ? JSON.parse(
            Buffer.from(session.access_token.split('.')[1], 'base64').toString()
          )
        : null,
    })
  }

  if (role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (API routes are handled separately)
     * - login, reset-password, and unauthorized pages
     */
    '/((?!_next/static|_next/image|favicon.ico|api|login|reset-password|unauthorized).*)',
  ],
}

