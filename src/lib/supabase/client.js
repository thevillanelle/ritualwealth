import { createBrowserClient } from '@supabase/ssr'

const COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? '.ritualware.app' : undefined

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
  {
    isSingleton: true,
    ...(COOKIE_DOMAIN && {
      cookieOptions: { domain: COOKIE_DOMAIN, sameSite: 'Lax', secure: true },
    }),
  }
)
