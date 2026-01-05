import { createServerClient, type CookieOptions as SupabaseCookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

type AnyCookieOptions = SupabaseCookieOptions & Record<string, unknown>

// For Server Components and Server Actions
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: AnyCookieOptions = {}) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
        remove(name: string, options: AnyCookieOptions = {}) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}

// For API Routes - uses NextRequest cookies
export function createClientForRouteHandler(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: AnyCookieOptions = {}) {
          // In API routes, we can't set cookies directly
          // The middleware handles cookie setting
        },
        remove(name: string, options: AnyCookieOptions = {}) {
          // In API routes, we can't remove cookies directly
          // The middleware handles cookie removal
        },
      },
    }
  )
}
