// Client-side Supabase client
import { createBrowserClient } from '@supabase/ssr'

function cleanUrl(url?: string) {
  if (!url) return '';
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export function createClient() {
  const url = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createBrowserClient(url, key);
}
