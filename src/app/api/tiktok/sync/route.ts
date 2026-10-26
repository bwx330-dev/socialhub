import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { TikTokAPI } from '@/lib/tiktok';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Fetch connected TikTok account
    const { data: accounts, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('platform', 'tiktok')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error || !accounts || accounts.length === 0) {
      return NextResponse.json(
        { error: 'Akun TikTok tidak ditemukan di database.' },
        { status: 404 }
      );
    }

    const account = accounts[0];

    // 2. Check if account is connected via official OAuth API
    if (
      !account.access_token ||
      account.access_token === 'manual_token' ||
      account.access_token === 'manual'
    ) {
      return NextResponse.json({
        success: false,
        isManual: true,
        username: account.username,
        message: 'Akun TikTok ini masih berstatus Input Manual (belum terintegrasi OAuth API resmi). Silakan klik OAuth TikTok untuk mengaktifkan auto-update metrik dari API.',
      });
    }

    // 3. Call official TikTok v2 API to fetch live stats
    const tiktok = new TikTokAPI(account.access_token);
    const userInfo = await tiktok.getUserInfo();

    if (userInfo.error && userInfo.error.code !== 'ok') {
      console.error('TikTok API sync error:', userInfo.error);
      return NextResponse.json({
        success: false,
        isManual: false,
        error: userInfo.error.message || 'Token TikTok mungkin kedaluwarsa. Silakan lakukan OAuth ulang.',
      }, { status: 400 });
    }

    const userData = userInfo?.data?.user || {};

    const updatedData = {
      follower_count: typeof userData.follower_count === 'number' ? userData.follower_count : account.follower_count,
      following_count: typeof userData.following_count === 'number' ? userData.following_count : account.following_count,
      post_count: typeof userData.video_count === 'number' ? userData.video_count : account.post_count,
      profile_pic: userData.avatar_url || account.profile_pic,
      updated_at: new Date().toISOString(),
    };

    // 4. Update Supabase
    const { data: updated, error: updateError } = await supabase
      .from('connected_accounts')
      .update(updatedData)
      .eq('id', account.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update TikTok stats in DB:', updateError);
      return NextResponse.json({ error: 'Gagal memperbarui database' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      isManual: false,
      account: updated,
      message: `Metrik ${account.username} berhasil disinkronkan otomatis dari TikTok API!`,
    });
  } catch (err: any) {
    console.error('TikTok sync exception:', err);
    return NextResponse.json({ error: err.message || 'Gagal sinkronisasi API' }, { status: 500 });
  }
}
