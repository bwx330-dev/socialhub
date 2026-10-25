import { NextResponse } from 'next/server';
import { getInstagramAuthUrl } from '@/lib/instagram';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const appId = process.env.INSTAGRAM_APP_ID;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

    if (!appId || !redirectUri) {
      return NextResponse.json(
        { error: 'Instagram app configuration is missing. Set INSTAGRAM_APP_ID and INSTAGRAM_REDIRECT_URI env vars.' },
        { status: 500 }
      );
    }

    const authUrl = getInstagramAuthUrl(appId, redirectUri);

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Instagram connect error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Instagram auth URL' },
      { status: 500 }
    );
  }
}
