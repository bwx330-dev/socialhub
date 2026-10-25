import { NextResponse } from 'next/server';
import { isAyrshareConfigured, getAyrshareClient } from '@/lib/ayrshare';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const configured = isAyrshareConfigured();

    if (!configured) {
      return NextResponse.json({
        connected: false,
        message: 'AYRSHARE_API_KEY belum diatur di .env.local',
        profiles: [],
      });
    }

    const client = getAyrshareClient()!;

    // Try to get user info and connected profiles
    try {
      const user = await client.getUser();

      // Extract connected platforms
      const activePlatforms: string[] = [];
      if (user?.displayNames) {
        for (const [platform, name] of Object.entries(user.displayNames)) {
          if (name) activePlatforms.push(platform);
        }
      }

      return NextResponse.json({
        connected: true,
        profiles: activePlatforms,
        displayNames: user?.displayNames || {},
        email: user?.email || '',
      });
    } catch {
      return NextResponse.json({
        connected: true,
        profiles: [],
        message: 'API key valid tapi gagal ambil profil. Pastikan akun sosmed sudah terhubung di Ayrshare.',
      });
    }
  } catch (error) {
    console.error('Ayrshare status error:', error);
    return NextResponse.json(
      { connected: false, error: 'Gagal cek status Ayrshare' },
      { status: 500 }
    );
  }
}
