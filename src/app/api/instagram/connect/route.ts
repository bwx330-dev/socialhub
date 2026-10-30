import { NextResponse } from 'next/server';
import { getInstagramAuthUrl } from '@/lib/instagram';

export const dynamic = 'force-dynamic';

const DEFAULT_APP_ID = '29177241588566729';
const DEFAULT_REDIRECT_URI = 'https://socialhub-wine.vercel.app/api/instagram/callback';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;
    const proto = request.headers.get('x-forwarded-proto') || (url.protocol.replace(':', '')) || 'https';
    const dynamicRedirectUri = `${proto}://${host}/api/instagram/callback`;

    const appId = process.env.INSTAGRAM_APP_ID || DEFAULT_APP_ID;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || dynamicRedirectUri || DEFAULT_REDIRECT_URI;

    const authUrl = getInstagramAuthUrl(appId, redirectUri);

    return NextResponse.json({ url: authUrl, redirectUri });
  } catch (error) {
    console.error('Instagram connect error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Instagram auth URL' },
      { status: 500 }
    );
  }
}
