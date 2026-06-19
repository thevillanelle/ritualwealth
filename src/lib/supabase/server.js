import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.ritualware.app' : undefined

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              ...options,
              ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
            })
          )
        },
      },
    }
  )
}
