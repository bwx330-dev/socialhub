import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { ScheduledPost } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Shared in-memory store (in production, this would be Supabase)
// For demo purposes, we maintain a separate store here.
// In a real app, this would query the same DB as the parent /api/posts route.
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
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
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
    scheduled_at: new Date(Date.now() - 172800000).toISOString(),
    status: 'published',
    published_at: new Date(Date.now() - 172800000).toISOString(),
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

function findPost(id: string): ScheduledPost | undefined {
  return postsStore.find(p => p.id === id);
}

// GET: Get single post details
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value || 'demo_user';

    const { id } = await params;

    const post = findPost(id);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: post });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT: Update a post
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value || 'demo_user';

    const { id } = await params;

    const postIndex = postsStore.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const existingPost = postsStore[postIndex];

    // Only allow editing pending posts
    if (existingPost.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot edit a post with status: ${existingPost.status}` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { caption, hashtags, media_url, media_type, scheduled_at } = body;

    // Validate caption if provided
    if (caption !== undefined) {
      if (typeof caption !== 'string' || caption.trim().length === 0) {
        return NextResponse.json(
          { error: 'Caption cannot be empty' },
          { status: 400 }
        );
      }
      if (caption.length > 2200) {
        return NextResponse.json(
          { error: 'Caption must be 2200 characters or less' },
          { status: 400 }
        );
      }
    }

    // Validate scheduled_at if provided
    if (scheduled_at !== undefined) {
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

    // Validate media_type if provided
    const validMediaTypes = ['image', 'video', 'carousel'];
    if (media_type !== undefined && !validMediaTypes.includes(media_type)) {
      return NextResponse.json(
        { error: `Invalid media_type. Use: ${validMediaTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Apply updates
    const updatedPost: ScheduledPost = {
      ...existingPost,
      caption: caption !== undefined ? caption.trim() : existingPost.caption,
      hashtags: Array.isArray(hashtags)
        ? hashtags.filter((h: unknown) => typeof h === 'string').map((h: string) => h.replace(/^#/, '').trim())
        : existingPost.hashtags,
      media_url: media_url !== undefined ? media_url : existingPost.media_url,
      media_type: media_type !== undefined ? media_type : existingPost.media_type,
      scheduled_at: scheduled_at !== undefined ? scheduled_at : existingPost.scheduled_at,
    };

    postsStore[postIndex] = updatedPost;

    return NextResponse.json({
      data: updatedPost,
      message: 'Post updated successfully',
    });
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE: Delete/cancel a post
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value || 'demo_user';

    const { id } = await params;

    const postIndex = postsStore.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const post = postsStore[postIndex];

    // If the post is pending, cancel it instead of hard-deleting
    if (post.status === 'pending') {
      postsStore[postIndex] = { ...post, status: 'cancelled' };
      return NextResponse.json({
        data: postsStore[postIndex],
        message: 'Scheduled post cancelled successfully',
      });
    }

    // For published/failed/cancelled posts, perform a hard delete
    postsStore.splice(postIndex, 1);

    return NextResponse.json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
