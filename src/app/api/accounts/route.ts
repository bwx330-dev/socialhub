import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

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

    // 1. If user is logged in, check their accounts first
    if (userId) {
      const { data: userAccounts, error: userError } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!userError && userAccounts && userAccounts.length > 0) {
        return NextResponse.json({ accounts: userAccounts.map(mapAccount) });
      }
    }

    // 2. Fallback: Return all active connected accounts so accounts like @bwxtigaadelapann are never lost
    const { data, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch accounts error:', error);
      return NextResponse.json({ accounts: [] });
    }

    return NextResponse.json({ accounts: (data || []).map(mapAccount) });
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

      return NextResponse.json({ account: data?.[0], message: 'Akun berhasil diperbarui!' });
    } else {
      const { data, error } = await supabase
        .from('connected_accounts')
        .insert(payload)
        .select();

      if (error) {
        console.error('Insert account error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ account: data?.[0], message: 'Akun berhasil ditambahkan!' });
    }
  } catch (error) {
    console.error('Save account error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID akun wajib diisi' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('connected_accounts')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Akun berhasil diputuskan' });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
