import { NextResponse } from 'next/server';
import { getTikTokAuthUrl } from '@/lib/tiktok';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI;

    if (!clientKey || !redirectUri) {
      return NextResponse.json(
        { error: 'TIKTOK_CLIENT_KEY dan TIKTOK_REDIRECT_URI belum diatur di .env.local' },
        { status: 500 }
      );
    }

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
