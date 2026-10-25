// Server-side Supabase client for API routes
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const DEFAULT_URL = 'https://rylmpuedkrwonsyeiqoi.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bG1wdWVka3J3b25zeWVpcW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4ODk0NzgsImV4cCI6MjEwODQ2NTQ3OH0.zk_JWBE-zES7ACXKYZNw9UFk9albSih_qI8euduykAQ';

function cleanUrl(url?: string) {
  if (!url) return '';
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const url = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) || DEFAULT_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY;
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
