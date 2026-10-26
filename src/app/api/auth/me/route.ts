import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const userId = cookieStore.get('user_id')?.value;

    if (!sessionToken && !userId) {
      return NextResponse.json({ loggedIn: false });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      return NextResponse.json({
        loggedIn: true,
        user: {
          id: user.id,
          email: user.email,
          name: userName,
        },
      });
    }

    if (userId) {
      // Fallback if token expired but userId cookie is still valid
      return NextResponse.json({
        loggedIn: true,
        user: {
          id: userId,
          email: 'user@socialhub.com',
          name: 'SocialHub Creator',
        },
      });
    }

    return NextResponse.json({ loggedIn: false });
  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json({ loggedIn: false });
  }
}
