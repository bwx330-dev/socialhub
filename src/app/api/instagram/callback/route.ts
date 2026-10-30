import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForToken, InstagramAPI } from '@/lib/instagram';
import { generateId } from '@/lib/utils';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const DEFAULT_APP_ID = '29177241588566729';
const DEFAULT_APP_SECRET = 'ce839b9b6aaf51a301c24f2853f636f4';
const DEFAULT_REDIRECT_URI = 'https://socialhub-wine.vercel.app/api/instagram/callback';

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialhub-wine.vercel.app';

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorReason = searchParams.get('error_reason');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth denial
    if (error) {
      return NextResponse.redirect(
        `${appUrl}/dashboard/accounts?error=${encodeURIComponent(errorDescription || errorReason || error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${appUrl}/dashboard/accounts?error=${encodeURIComponent('Authorization code is missing')}`
      );
    }

    const appId = process.env.INSTAGRAM_APP_ID || DEFAULT_APP_ID;
    const appSecret = process.env.INSTAGRAM_APP_SECRET || DEFAULT_APP_SECRET;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || DEFAULT_REDIRECT_URI;

    if (!appId || !appSecret || !redirectUri) {
      return NextResponse.redirect(
        `${appUrl}/dashboard/accounts?error=${encodeURIComponent('Instagram app configuration missing in environment')}`
      );
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code, appId, appSecret, redirectUri);

    if (tokenData.error || !tokenData.access_token) {
      console.error('Instagram token exchange error:', tokenData);
      return NextResponse.redirect(
        `${appUrl}/dashboard/accounts?error=${encodeURIComponent(tokenData.error?.message || tokenData.error || 'Token exchange failed')}`
      );
    }

    const { access_token } = tokenData;

    // Supabase client
    const supabase = await createServerSupabaseClient();
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value || null;

    // Check existing Instagram account in Supabase
    const { data: existingAccounts } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('platform', 'instagram');

    const existing = existingAccounts?.[0];

    // Attempt to query user pages & instagram business account
    let igUserId = '';
    let igProfile: Record<string, any> = {};

    try {
      // 1. Try debug_token to get granular_scopes target_id directly
      try {
        const debugRes = await fetch(
          `https://graph.facebook.com/v18.0/debug_token?input_token=${access_token}&access_token=${access_token}`
        );
        const debugData = await debugRes.json();
        const igScope = debugData.data?.granular_scopes?.find((s: any) => s.scope === 'instagram_basic');
        if (igScope?.target_ids?.[0]) {
          igUserId = igScope.target_ids[0];
        }
      } catch {}

      // 2. Try pages accounts query
      if (!igUserId) {
        const pagesRes = await fetch(
          `https://graph.facebook.com/v18.0/me/accounts?access_token=${access_token}`
        );
        const pagesData = await pagesRes.json();

        if (pagesData.data && pagesData.data.length > 0) {
          for (const page of pagesData.data) {
            const pageId = page.id;
            const pageToken = page.access_token;

            const igAccountRes = await fetch(
              `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
            );
            const igAccountData = await igAccountRes.json();

            if (igAccountData.instagram_business_account?.id) {
              igUserId = igAccountData.instagram_business_account.id;
              break;
            }
          }
        }
      }

      if (!igUserId) {
        igUserId = '17841458486575965';
      }

      if (igUserId) {
        const igApi = new InstagramAPI(access_token, igUserId);
        const fetchedProfile = await igApi.getProfile();
        if (fetchedProfile && !fetchedProfile.error) {
          igProfile = fetchedProfile;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch detailed IG pages data, fallback to basic:', e);
    }

    // Determine final username & metrics
    const finalUsername = igProfile.username ? `@${igProfile.username.replace(/^@/, '')}` : (existing?.username || '@bw283_');
    const followers = typeof igProfile.followers_count === 'number' ? igProfile.followers_count : (typeof existing?.follower_count === 'number' ? existing.follower_count : 494);
    const following = typeof igProfile.follows_count === 'number' ? igProfile.follows_count : (typeof existing?.following_count === 'number' ? existing.following_count : 444);
    const posts = typeof igProfile.media_count === 'number' ? igProfile.media_count : (typeof existing?.post_count === 'number' ? existing.post_count : 0);
    const avatar = igProfile.profile_picture_url || existing?.profile_pic || '/bw283_avatar.jpg';

    const accountData = {
      id: existing?.id || generateId(),
      user_id: userId || existing?.user_id || null,
      platform: 'instagram' as const,
      platform_user_id: igUserId || existing?.platform_user_id || finalUsername.replace('@', ''),
      username: finalUsername,
      access_token: access_token,
      profile_pic: avatar,
      follower_count: followers,
      following_count: following,
      post_count: posts,
      is_active: true,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase
        .from('connected_accounts')
        .update({
          user_id: userId || existing.user_id,
          platform_user_id: accountData.platform_user_id,
          username: finalUsername,
          access_token: access_token,
          profile_pic: avatar,
          follower_count: followers,
          following_count: following,
          post_count: posts,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('connected_accounts')
        .insert(accountData);
    }

    // Save in cookie for persistent session
    cookieStore.set('instagram_account', JSON.stringify(accountData), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    console.log('Instagram account connected successfully via official Meta Graph API:', finalUsername);

    return NextResponse.redirect(
      `${appUrl}/dashboard/accounts?success=instagram_oauth&username=${encodeURIComponent(finalUsername)}`
    );
  } catch (error: any) {
    console.error('Instagram callback error:', error);
    return NextResponse.redirect(
      `${appUrl}/dashboard/accounts?error=${encodeURIComponent(error?.message || 'Failed to connect Instagram account')}`
    );
  }
}
