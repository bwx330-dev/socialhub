import { NextResponse } from 'next/server';
import { getTikTokAuthUrl } from '@/lib/tiktok';

export const dynamic = 'force-dynamic';

const DEFAULT_CLIENT_KEY = 'sbawme1rsldz5jtdej';
const DEFAULT_REDIRECT_URI = 'https://socialhub-wine.vercel.app/api/tiktok/callback';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;
    const proto = request.headers.get('x-forwarded-proto') || (url.protocol.replace(':', '')) || 'https';
    
    // Dynamic redirect URI according to the current host
    const dynamicRedirectUri = `${proto}://${host}/api/tiktok/callback`;
    const clientKey = process.env.TIKTOK_CLIENT_KEY || DEFAULT_CLIENT_KEY;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI || dynamicRedirectUri || DEFAULT_REDIRECT_URI;

    const authUrl = getTikTokAuthUrl(clientKey, redirectUri);

    return NextResponse.json({ url: authUrl, redirectUri });
  } catch (error) {
    console.error('TikTok connect error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat TikTok auth URL' },
      { status: 500 }
    );
  }
}
