import { NextResponse } from 'next/server';
import { getAyrshareClient } from '@/lib/ayrshare';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const client = getAyrshareClient();

    if (!client) {
      return NextResponse.json(
        { error: 'Ayrshare belum dikonfigurasi. Tambahkan AYRSHARE_API_KEY di .env.local' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { caption, platforms, mediaUrls, hashtags, scheduleDate } = body;

    if (!caption || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Caption dan platform wajib diisi' },
        { status: 400 }
      );
    }

    const result = await client.post({
      post: caption,
      platforms,
      mediaUrls: mediaUrls || [],
      hashtags: hashtags || [],
      scheduleDate: scheduleDate || undefined,
    });

    // Check for errors in result
    if (result.status === 'error') {
      return NextResponse.json(
        { error: result.message || 'Gagal posting ke Ayrshare', details: result },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: scheduleDate ? 'Post berhasil dijadwalkan via Ayrshare!' : 'Post berhasil dipublish via Ayrshare!',
      data: result,
    });
  } catch (error) {
    console.error('Ayrshare publish error:', error);
    return NextResponse.json(
      { error: 'Gagal posting via Ayrshare' },
      { status: 500 }
    );
  }
}
