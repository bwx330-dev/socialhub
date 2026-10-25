import { NextResponse } from 'next/server';
import { InstagramAPI } from '@/lib/instagram';
import { TikTokAPI } from '@/lib/tiktok';
import type { ScheduledPost, ConnectedAccount } from '@/lib/types';

// Mock data stores — in production, these would be Supabase queries
const mockAccounts: ConnectedAccount[] = [
  {
    id: 'acct_1',
    user_id: 'demo_user',
    platform: 'instagram',
    platform_user_id: 'ig_12345',
    username: 'socialhub_demo',
    access_token: 'mock_ig_token',
    follower_count: 14250,
    following_count: 890,
    post_count: 342,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'acct_2',
    user_id: 'demo_user',
    platform: 'tiktok',
    platform_user_id: 'tt_67890',
    username: 'socialhub_tiktok',
    access_token: 'mock_tt_token',
    follower_count: 8500,
    following_count: 200,
    post_count: 120,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const mockPendingPosts: ScheduledPost[] = [
  {
    id: 'sched_1',
    user_id: 'demo_user',
    account_id: 'acct_1',
    platform: 'instagram',
    caption: 'Automated post from SocialHub scheduler! 🤖',
    hashtags: ['automation', 'socialmedia', 'scheduler'],
    media_url: 'https://picsum.photos/seed/scheduled1/640/640',
    media_type: 'image',
    scheduled_at: new Date(Date.now() - 60000).toISOString(), // 1 minute ago (should be picked up)
    status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

interface SchedulerResult {
  post_id: string;
  platform: string;
  status: 'published' | 'failed';
  error?: string;
}

async function publishToInstagram(
  post: ScheduledPost,
  account: ConnectedAccount
): Promise<SchedulerResult> {
  try {
    const igApi = new InstagramAPI(account.access_token, account.platform_user_id);

    if (!post.media_url) {
      return {
        post_id: post.id,
        platform: 'instagram',
        status: 'failed',
        error: 'No media URL provided',
      };
    }

    let result;
    if (post.media_type === 'video') {
      const fullCaption = post.hashtags.length > 0
        ? `${post.caption}\n\n${post.hashtags.map(h => `#${h}`).join(' ')}`
        : post.caption;
      result = await igApi.publishVideo(post.media_url, fullCaption);
    } else {
      const fullCaption = post.hashtags.length > 0
        ? `${post.caption}\n\n${post.hashtags.map(h => `#${h}`).join(' ')}`
        : post.caption;
      result = await igApi.publishPhoto(post.media_url, fullCaption);
    }

    if (result.error) {
      return {
        post_id: post.id,
        platform: 'instagram',
        status: 'failed',
        error: result.error.message || 'Instagram API error',
      };
    }

    return {
      post_id: post.id,
      platform: 'instagram',
      status: 'published',
    };
  } catch (error) {
    return {
      post_id: post.id,
      platform: 'instagram',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function publishToTikTok(
  post: ScheduledPost,
  account: ConnectedAccount
): Promise<SchedulerResult> {
  try {
    const ttApi = new TikTokAPI(account.access_token);

    if (!post.media_url) {
      return {
        post_id: post.id,
        platform: 'tiktok',
        status: 'failed',
        error: 'No media URL provided',
      };
    }

    if (post.media_type !== 'video') {
      return {
        post_id: post.id,
        platform: 'tiktok',
        status: 'failed',
        error: 'TikTok only supports video content',
      };
    }

    const fullTitle = post.hashtags.length > 0
      ? `${post.caption} ${post.hashtags.map(h => `#${h}`).join(' ')}`
      : post.caption;

    const result = await ttApi.initUpload(post.media_url, fullTitle);

    if (result.error) {
      return {
        post_id: post.id,
        platform: 'tiktok',
        status: 'failed',
        error: result.error.message || 'TikTok API error',
      };
    }

    return {
      post_id: post.id,
      platform: 'tiktok',
      status: 'published',
    };
  } catch (error) {
    return {
      post_id: post.id,
      platform: 'tiktok',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// POST: Run the scheduler (called by cron job)
export async function POST(request: Request) {
  try {
    // Verify cron secret for security (optional — set CRON_SECRET env var)
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const now = new Date();

    // Find all pending posts where scheduled_at <= now
    // In production, this would be a Supabase query:
    // const { data: pendingPosts } = await supabase
    //   .from('posts')
    //   .select('*, connected_accounts(*)')
    //   .eq('status', 'pending')
    //   .lte('scheduled_at', now.toISOString())
    const pendingPosts = mockPendingPosts.filter(
      p => p.status === 'pending' && new Date(p.scheduled_at).getTime() <= now.getTime()
    );

    if (pendingPosts.length === 0) {
      return NextResponse.json({
        message: 'No posts to publish',
        processed: 0,
        results: [],
      });
    }

    const results: SchedulerResult[] = [];

    for (const post of pendingPosts) {
      // Find the connected account for this post
      const account = mockAccounts.find(a => a.id === post.account_id);

      if (!account) {
        results.push({
          post_id: post.id,
          platform: post.platform,
          status: 'failed',
          error: 'Connected account not found',
        });

        // Update post status
        post.status = 'failed';
        post.error_message = 'Connected account not found';
        continue;
      }

      if (!account.is_active) {
        results.push({
          post_id: post.id,
          platform: post.platform,
          status: 'failed',
          error: 'Connected account is inactive',
        });

        post.status = 'failed';
        post.error_message = 'Connected account is inactive';
        continue;
      }

      // Publish based on platform
      let result: SchedulerResult;

      switch (post.platform) {
        case 'instagram':
          result = await publishToInstagram(post, account);
          break;
        case 'tiktok':
          result = await publishToTikTok(post, account);
          break;
        default:
          result = {
            post_id: post.id,
            platform: post.platform,
            status: 'failed',
            error: `Unsupported platform: ${post.platform}`,
          };
      }

      // Update post status in store
      if (result.status === 'published') {
        post.status = 'published';
        post.published_at = new Date().toISOString();
      } else {
        post.status = 'failed';
        post.error_message = result.error;
      }

      results.push(result);
    }

    const published = results.filter(r => r.status === 'published').length;
    const failed = results.filter(r => r.status === 'failed').length;

    console.log(`Scheduler run complete: ${published} published, ${failed} failed out of ${results.length} total`);

    return NextResponse.json({
      message: `Scheduler run complete`,
      processed: results.length,
      published,
      failed,
      results,
    });
  } catch (error) {
    console.error('Scheduler error:', error);
    return NextResponse.json(
      { error: 'Scheduler execution failed' },
      { status: 500 }
    );
  }
}
