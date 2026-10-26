import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { TikTokAPI } from '@/lib/tiktok';

export const dynamic = 'force-dynamic';

async function autoSyncTikTokAccount(account: any, supabase: any) {
  if (
    !account.access_token ||
    account.access_token === 'manual_token' ||
    account.access_token === 'manual' ||
    account.access_token.length < 20
  ) {
    return account;
  }

  // Throttle check: if updated less than 10 seconds ago, return cached to avoid spamming TikTok API
  const lastUpdated = account.updated_at ? new Date(account.updated_at).getTime() : 0;
  const now = Date.now();
  if (now - lastUpdated < 10000) {
    return account;
  }

  try {
    const tiktok = new TikTokAPI(account.access_token);
    const userInfo = await tiktok.getUserInfo();
    const userData = userInfo?.data?.user;

    if (userData) {
      let finalUsername = account.username;
      if (!finalUsername || finalUsername.startsWith('@tiktok_-') || finalUsername === '@b') {
        finalUsername = '@bwxtigaadelapann';
      }

      const updatedFields = {
        username: finalUsername,
        follower_count: typeof userData.follower_count === 'number' ? userData.follower_count : account.follower_count,
        following_count: typeof userData.following_count === 'number' ? userData.following_count : account.following_count,
        post_count: typeof userData.video_count === 'number' ? userData.video_count : account.post_count,
        profile_pic: userData.avatar_url || account.profile_pic,
        updated_at: new Date().toISOString(),
      };

      await supabase
        .from('connected_accounts')
        .update(updatedFields)
        .eq('id', account.id);

      return {
        ...account,
        ...updatedFields,
      };
    }
  } catch (err) {
    console.error('Auto-sync TikTok failed:', err);
  }
  return account;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    const supabase = await createServerSupabaseClient();

    const mapAccount = (acc: any) => ({
      ...acc,
      is_api_connected: Boolean(
        acc.access_token &&
        acc.access_token !== 'manual_token' &&
        acc.access_token !== 'manual' &&
        acc.access_token.length > 20
      ),
    });

    const syncAll = async (rawAccounts: any[]) => {
      const synced = await Promise.all(
        rawAccounts.map((acc) =>
          acc.platform === 'tiktok' ? autoSyncTikTokAccount(acc, supabase) : acc
        )
      );
      return synced.map(mapAccount);
    };

    // 1. If user is logged in, check their accounts first
    if (userId) {
      const { data: userAccounts, error: userError } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!userError && userAccounts && userAccounts.length > 0) {
        const finalAccounts = await syncAll(userAccounts);
        return NextResponse.json({ accounts: finalAccounts });
      }
    }

    // 2. Fallback: Return all active connected accounts
    const { data, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch accounts error:', error);
      return NextResponse.json({ accounts: [] });
    }

    const finalAccounts = await syncAll(data || []);
    return NextResponse.json({ accounts: finalAccounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json({ accounts: [] });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value || null;

    const body = await request.json();
    const { platform, username, follower_count, following_count, post_count, profile_pic } = body;

    if (!platform || !username) {
      return NextResponse.json(
        { error: 'Platform dan username wajib diisi' },
        { status: 400 }
      );
    }

    const cleanUsername = username.replace(/^@/, '').trim();
    const supabase = await createServerSupabaseClient();

    // Check if account already exists for this platform
    let existingQuery = supabase
      .from('connected_accounts')
      .select('id')
      .eq('platform', platform)
      .eq('platform_user_id', cleanUsername);

    if (userId) {
      existingQuery = existingQuery.eq('user_id', userId);
    }

    const { data: existing } = await existingQuery.limit(1);

    const payload = {
      user_id: userId,
      platform,
      platform_user_id: cleanUsername,
      username: `@${cleanUsername}`,
      access_token: 'manual_token',
      follower_count: parseInt(follower_count, 10) || 0,
      following_count: parseInt(following_count, 10) || 0,
      post_count: parseInt(post_count, 10) || 0,
      profile_pic: profile_pic || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    if (existing && existing.length > 0) {
      const { data, error } = await supabase
        .from('connected_accounts')
        .update(payload)
        .eq('id', existing[0].id)
        .select();

      if (error) {
        console.error('Update account error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        account: data[0],
        message: `Akun @${cleanUsername} berhasil diperbarui!`,
      });
    }

    const { data, error } = await supabase
      .from('connected_accounts')
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error('Insert account error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      account: data[0],
      message: `Akun @${cleanUsername} berhasil dihubungkan!`,
    });
  } catch (error) {
    console.error('Save account error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat menyimpan akun' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('connected_accounts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete account error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Akun berhasil diputuskan' });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
