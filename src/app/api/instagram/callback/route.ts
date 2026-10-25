import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForToken, InstagramAPI } from '@/lib/instagram';
import { generateId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorReason = searchParams.get('error_reason');

    // Handle OAuth denial
    if (error) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.redirect(
        `${appUrl}/dashboard/accounts?error=${encodeURIComponent(errorReason || error)}`
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    const appId = process.env.INSTAGRAM_APP_ID;
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

    if (!appId || !appSecret || !redirectUri) {
      return NextResponse.json(
        { error: 'Instagram app configuration is missing' },
        { status: 500 }
      );
    }

    // Verify user is logged in
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${appUrl}/login?error=not_authenticated`);
    }

    // Exchange the code for an access token
    const tokenData = await exchangeCodeForToken(code, appId, appSecret, redirectUri);

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.redirect(
        `${appUrl}/dashboard/accounts?error=${encodeURIComponent(tokenData.error.message || 'Token exchange failed')}`
      );
    }

    const { access_token } = tokenData;

    // Fetch Instagram profile using the token
    // First, we need to get the IG user ID via the Facebook Pages API
    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${access_token}`
    );
    const pagesData = await pagesRes.json();

    let igUserId = '';
    let igProfile: Record<string, unknown> = {};

    if (pagesData.data && pagesData.data.length > 0) {
      // Get IG business account from the first page
      const pageId = pagesData.data[0].id;
      const pageToken = pagesData.data[0].access_token;

      const igAccountRes = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
      );
      const igAccountData = await igAccountRes.json();

      if (igAccountData.instagram_business_account) {
        igUserId = igAccountData.instagram_business_account.id;

        // Fetch full IG profile
        const igApi = new InstagramAPI(access_token, igUserId);
        igProfile = await igApi.getProfile();
      }
    }

    // Store the connected account
    // In production, this would go to Supabase
    const connectedAccount = {
      id: generateId(),
      user_id: userId,
      platform: 'instagram' as const,
      platform_user_id: igUserId || 'unknown',
      username: (igProfile as { username?: string }).username || 'unknown',
      access_token: access_token,
      profile_pic: (igProfile as { profile_picture_url?: string }).profile_picture_url || null,
      follower_count: (igProfile as { followers_count?: number }).followers_count || 0,
      following_count: (igProfile as { follows_count?: number }).follows_count || 0,
      post_count: (igProfile as { media_count?: number }).media_count || 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    // Log the connected account (in production, save to DB)
    console.log('Instagram account connected:', {
      id: connectedAccount.id,
      username: connectedAccount.username,
      user_id: connectedAccount.user_id,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${appUrl}/dashboard/accounts?success=instagram_connected&username=${encodeURIComponent(connectedAccount.username)}`
    );
  } catch (error) {
    console.error('Instagram callback error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${appUrl}/dashboard/accounts?error=${encodeURIComponent('Failed to connect Instagram account')}`
    );
  }
}
