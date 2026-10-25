import { NextResponse } from 'next/server';
import { getTikTokAuthUrl } from '@/lib/tiktok';

export const dynamic = 'force-dynamic';

const DEFAULT_CLIENT_KEY = 'sbawme1rsldz5jtdej';
const DEFAULT_REDIRECT_URI = 'https://socialhub-wine.vercel.app/api/tiktok/callback';

export async function GET() {
  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY || DEFAULT_CLIENT_KEY;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI || DEFAULT_REDIRECT_URI;

    const authUrl = getTikTokAuthUrl(clientKey, redirectUri);

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('TikTok connect error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat TikTok auth URL' },
      { status: 500 }
    );
  }
}
