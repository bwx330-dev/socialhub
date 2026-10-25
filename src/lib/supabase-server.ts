// Server-side Supabase client for API routes
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function cleanUrl(url?: string) {
  if (!url) return '';
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const url = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}
