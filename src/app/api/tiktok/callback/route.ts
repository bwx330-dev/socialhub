import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TikTokAPI } from '@/lib/tiktok';
import { generateId } from '@/lib/utils';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;
    const proto = request.headers.get('x-forwarded-proto') || (url.protocol.replace(':', '')) || 'https';
    const appUrl = `${proto}://${host}`;

    const { searchParams } = url;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth denial
    if (error) {
      return NextResponse.redirect(
        `${appUrl}/dashboard/accounts?error=${encodeURIComponent(errorDescription || error)}`
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY || 'sbawme1rsldz5jtdej';
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET || 'sRo9TFc2nmezvFl8vRFojQXTWj14ZkjM';
    const dynamicRedirectUri = `${appUrl}/api/tiktok/callback`;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI || dynamicRedirectUri;

    if (!clientKey || !clientSecret) {
      return NextResponse.json(
        { error: 'TikTok app configuration is missing' },
        { status: 500 }
      );
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error('TikTok token exchange failed:', tokenData);
      return NextResponse.redirect(
        `${appUrl}/dashboard/accounts?error=${encodeURIComponent(tokenData.error_description || tokenData.error || 'Token exchange failed')}`
      );
    }

    const {
      access_token,
      refresh_token,
      expires_in,
      open_id,
    } = tokenData;

    // Get user profile info via GET
    const tiktok = new TikTokAPI(access_token);
    const userInfo = await tiktok.getUserInfo();
    const userData = userInfo?.data?.user || {};

    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value || null;

    const rawUsername = userData.display_name || `tiktok_${open_id?.slice(0, 8)}`;
    const cleanUsername = rawUsername.replace(/^@/, '');

    const accountData = {
      id: generateId(),
      user_id: userId,
      platform: 'tiktok',
      platform_user_id: open_id || cleanUsername,
      username: `@${cleanUsername}`,
      access_token,
      refresh_token: refresh_token || null,
      token_expires_at: new Date(Date.now() + (expires_in || 86400) * 1000).toISOString(),
      profile_pic: userData.avatar_url || '',
      follower_count: userData.follower_count || 0,
      following_count: userData.following_count || 0,
      post_count: userData.video_count || 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save account into Supabase cleanly
    try {
      const supabase = await createServerSupabaseClient();
      
      // Check if TikTok account already exists in database
      const { data: existingAccounts } = await supabase
        .from('connected_accounts')
        .select('id')
        .eq('platform', 'tiktok');

      if (existingAccounts && existingAccounts.length > 0) {
        // Update existing record with real OAuth tokens and live metrics
        await supabase
          .from('connected_accounts')
          .update({
            user_id: userId,
            platform_user_id: open_id || cleanUsername,
            username: `@${cleanUsername}`,
            access_token,
            refresh_token: refresh_token || null,
            token_expires_at: accountData.token_expires_at,
            profile_pic: userData.avatar_url || null,
            follower_count: userData.follower_count || 0,
            following_count: userData.following_count || 0,
            post_count: userData.video_count || 0,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingAccounts[0].id);
      } else {
        // Insert new record
        await supabase
          .from('connected_accounts')
          .insert({
            id: generateId(),
            user_id: userId,
            platform: 'tiktok',
            platform_user_id: open_id || cleanUsername,
            username: `@${cleanUsername}`,
            access_token,
            refresh_token: refresh_token || null,
            token_expires_at: accountData.token_expires_at,
            profile_pic: userData.avatar_url || null,
            follower_count: userData.follower_count || 0,
            following_count: userData.following_count || 0,
            post_count: userData.video_count || 0,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
      }
    } catch (dbErr) {
      console.error('Failed to save to Supabase:', dbErr);
    }

    // Save in cookie
    cookieStore.set('tiktok_account', JSON.stringify(accountData), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    console.log('TikTok account connected successfully via official OAuth API:', cleanUsername);

    // Redirect back to accounts page with success notification
    return NextResponse.redirect(
      `${appUrl}/dashboard/accounts?success=tiktok_oauth&username=${encodeURIComponent(cleanUsername)}`
    );
  } catch (error) {
    console.error('TikTok callback error:', error);
    const url = new URL(request.url);
    return NextResponse.redirect(
      `${url.origin}/dashboard/accounts?error=${encodeURIComponent('TikTok connection failed')}`
    );
  }
}
