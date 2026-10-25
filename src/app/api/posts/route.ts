import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateId } from '@/lib/utils';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { ScheduledPost } from '@/lib/types';

export const dynamic = 'force-dynamic';

// In-memory store for mock data (in production, this would be Supabase)
const postsStore: ScheduledPost[] = [
  {
    id: 'demo_post_1',
    user_id: 'demo_user',
    account_id: 'demo_account',
    platform: 'instagram',
    caption: 'Exciting new product launch! Stay tuned for something amazing 🚀',
    hashtags: ['launch', 'newproduct', 'innovation', 'tech'],
    media_url: 'https://picsum.photos/seed/post1/640/640',
    media_type: 'image',
    scheduled_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo_post_2',
    user_id: 'demo_user',
    account_id: 'demo_account',
    platform: 'instagram',
    caption: 'Behind the scenes of our creative process 🎨',
    hashtags: ['bts', 'creative', 'design'],
    media_url: 'https://picsum.photos/seed/post2/640/640',
    media_type: 'image',
    scheduled_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    status: 'published',
    published_at: new Date(Date.now() - 172800000).toISOString(),
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'demo_post_3',
    user_id: 'demo_user',
    account_id: 'demo_account',
    platform: 'tiktok',
    caption: 'Quick tutorial on our latest feature! #tutorial #howto',
    hashtags: ['tutorial', 'howto', 'tips'],
    media_url: 'https://picsum.photos/seed/post3/640/640',
    media_type: 'video',
    scheduled_at: new Date(Date.now() + 172800000).toISOString(), // In 2 days
    status: 'pending',
    created_at: new Date().toISOString(),
  },
];

// GET: List all posts (with optional filters)
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value || 'demo_user';

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending | published | failed | cancelled
    const platform = searchParams.get('platform'); // instagram | tiktok
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let filtered = [...postsStore];

    // Try fetching from Supabase if configured
    try {
      const supabase = await createServerSupabaseClient();
      let query = supabase.from('posts').select('*');
      if (status) query = query.eq('status', status);
      if (platform) query = query.eq('platform', platform);
      const { data: dbData } = await query.order('scheduled_at', { ascending: false });
      if (dbData && dbData.length > 0) {
        filtered = dbData.map((d) => ({
          id: d.id,
          user_id: d.user_id || 'demo_user',
          account_id: d.account_id || 'default_account',
          platform: d.platform,
          caption: d.caption,
          hashtags: d.hashtags || [],
          media_url: d.media_url,
          media_type: d.media_type,
          scheduled_at: d.scheduled_at,
          status: d.status,
          published_at: d.published_at,
          error_message: d.error_message,
          created_at: d.created_at,
        }));
      }
    } catch {
      // Fallback to memory
    }

    // Filter by status (for memory fallback)
    if (status && ['pending', 'published', 'failed', 'cancelled'].includes(status)) {
      filtered = filtered.filter(p => p.status === status);
    }

    // Filter by platform
    if (platform && ['instagram', 'tiktok'].includes(platform)) {
      filtered = filtered.filter(p => p.platform === platform);
    }

    // Sort by scheduled_at (newest first)
    filtered.sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

    // Paginate
    const total = filtered.length;
    const clampedLimit = Math.min(Math.max(limit, 1), 100);
    const offset = (Math.max(page, 1) - 1) * clampedLimit;
    const paginated = filtered.slice(offset, offset + clampedLimit);

    return NextResponse.json({
      data: paginated,
      pagination: {
        page: Math.max(page, 1),
        limit: clampedLimit,
        total,
        total_pages: Math.ceil(total / clampedLimit),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST: Create a new post (immediate or scheduled)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value || 'demo_user';

    const body = await request.json();
    const { platform, caption, hashtags, media_url, media_type, scheduled_at, account_id } = body;

    // Validate required fields
    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required (instagram or tiktok)' },
        { status: 400 }
      );
    }

    if (!['instagram', 'tiktok'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Use: instagram or tiktok' },
        { status: 400 }
      );
    }

    if (!caption || caption.trim().length === 0) {
      return NextResponse.json(
        { error: 'Caption is required' },
        { status: 400 }
      );
    }

    if (caption.length > 2200) {
      return NextResponse.json(
        { error: 'Caption must be 2200 characters or less' },
        { status: 400 }
      );
    }

    // Validate media_type if provided
    const validMediaTypes = ['image', 'video', 'carousel'];
    const resolvedMediaType = media_type && validMediaTypes.includes(media_type) ? media_type : 'image';

    // Validate scheduled_at if provided
    if (scheduled_at) {
      const scheduledDate = new Date(scheduled_at);
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid scheduled_at date format' },
          { status: 400 }
        );
      }
      if (scheduledDate.getTime() < Date.now()) {
        return NextResponse.json(
          { error: 'Scheduled date must be in the future' },
          { status: 400 }
        );
      }
    }

    // Validate hashtags
    const resolvedHashtags: string[] = Array.isArray(hashtags)
      ? hashtags.filter((h: unknown) => typeof h === 'string' && h.trim().length > 0).map((h: string) => h.replace(/^#/, '').trim())
      : [];

    const newPost: ScheduledPost = {
      id: generateId(),
      user_id: userId,
      account_id: account_id || 'default_account',
      platform,
      caption: caption.trim(),
      hashtags: resolvedHashtags,
      media_url: media_url || undefined,
      media_type: resolvedMediaType,
      scheduled_at: scheduled_at || new Date().toISOString(),
      status: scheduled_at ? 'pending' : 'pending', // Both start as pending; scheduler will publish immediate ones
      created_at: new Date().toISOString(),
    };

    // If no scheduled_at, this is an immediate post — mark as published (mock)
    if (!scheduled_at) {
      newPost.status = 'published';
      newPost.published_at = new Date().toISOString();
    }

    // Store the post in memory
    postsStore.push(newPost);

    // Try saving to Supabase if table is created
    try {
      const supabase = await createServerSupabaseClient();
      const { error: insertError } = await supabase.from('posts').insert({
        platform,
        caption: caption.trim(),
        hashtags: resolvedHashtags,
        media_url: media_url || null,
        media_type: resolvedMediaType,
        scheduled_at: scheduled_at || new Date().toISOString(),
        status: newPost.status,
      });

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        // If RLS blocked it or foreign key failed, let the client know clearly
        return NextResponse.json(
          {
            error: `Gagal simpan ke Supabase: ${insertError.message} (Perlu matikan RLS di SQL Editor)`,
          },
          { status: 400 }
        );
      } else {
        console.log('Post saved successfully to Supabase!');
      }
    } catch (e) {
      console.error('Failed to communicate with Supabase:', e);
    }

    return NextResponse.json(
      {
        data: newPost,
        message: scheduled_at ? 'Post scheduled successfully' : 'Post published successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
