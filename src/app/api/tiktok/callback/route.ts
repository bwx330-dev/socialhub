import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TikTokAPI } from '@/lib/tiktok';
import { generateId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI;

    if (!clientKey || !clientSecret || !redirectUri) {
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
        `${appUrl}/dashboard/accounts?error=${encodeURIComponent(tokenData.error_description || 'Token exchange failed')}`
      );
    }

    const {
      access_token,
      refresh_token,
      expires_in,
      open_id,
    } = tokenData;

    // Get user profile info
    const tiktok = new TikTokAPI(access_token);
    const userInfo = await tiktok.getUserInfo();
    const userData = userInfo?.data?.user || {};

    // Store in cookie for demo (in production, save to Supabase)
    const cookieStore = await cookies();
    const accountData = {
      id: generateId(),
      platform: 'tiktok',
      platform_user_id: open_id,
      username: userData.display_name || `tiktok_${open_id?.slice(0, 8)}`,
      access_token,
      refresh_token,
      token_expires_at: new Date(Date.now() + (expires_in || 86400) * 1000).toISOString(),
      profile_pic: userData.avatar_url || '',
      follower_count: userData.follower_count || 0,
      following_count: userData.following_count || 0,
      post_count: userData.video_count || 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    // Save account info in cookie (demo) or Supabase (production)
    cookieStore.set('tiktok_account', JSON.stringify(accountData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    console.log('TikTok account connected:', accountData.username);

    // Redirect back to accounts page with success
    return NextResponse.redirect(
      `${appUrl}/dashboard/accounts?success=tiktok&username=${encodeURIComponent(accountData.username)}`
    );
  } catch (error) {
    console.error('TikTok callback error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${appUrl}/dashboard/accounts?error=${encodeURIComponent('TikTok connection failed')}`
    );
  }
}
