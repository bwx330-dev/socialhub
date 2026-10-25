import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { AnalyticsData, PostAnalytics, DashboardSummary } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Generate mock analytics data for the last N days
function generateMockDailyAnalytics(days: number): AnalyticsData[] {
  const data: AnalyticsData[] = [];
  const baseFollowers = 12500;
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dailyGrowth = Math.floor(Math.random() * 80) + 10;
    const followers = baseFollowers + (days - i) * dailyGrowth;
    const likes = Math.floor(Math.random() * 500) + 200;
    const comments = Math.floor(Math.random() * 100) + 20;
    const reach = Math.floor(Math.random() * 5000) + 2000;
    const impressions = reach + Math.floor(Math.random() * 3000);

    data.push({
      date: date.toISOString().split('T')[0],
      followers,
      following: Math.floor(followers * 0.15),
      posts: Math.floor(Math.random() * 3),
      likes,
      comments,
      reach,
      impressions,
      engagement_rate: parseFloat(((likes + comments) / reach * 100).toFixed(2)),
    });
  }

  return data;
}

// Generate mock post analytics
function generateMockPostAnalytics(): PostAnalytics[] {
  const posts: PostAnalytics[] = [];
  const captions = [
    'Check out our latest product launch! 🚀 #innovation #tech',
    'Behind the scenes of today\'s photoshoot 📸 #bts #creative',
    'Thank you for 10K followers! 🎉 #milestone #grateful',
    'Tips for growing your Instagram in 2024 📈 #growthhacks',
    'New collection dropping soon! Stay tuned 👀 #comingsoon',
    'Monday motivation to start the week strong 💪 #mondaymotivation',
    'Beautiful sunset from our office today 🌅 #officeviews',
    'Our team at the conference last weekend 🤝 #networking',
  ];

  const now = new Date();

  for (let i = 0; i < 8; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 2);
    const likes = Math.floor(Math.random() * 1500) + 300;
    const comments = Math.floor(Math.random() * 200) + 30;
    const reach = Math.floor(Math.random() * 8000) + 3000;

    posts.push({
      id: `post_${i + 1}`,
      post_id: `ig_post_${Date.now()}_${i}`,
      platform: 'instagram',
      likes,
      comments,
      shares: Math.floor(Math.random() * 100) + 10,
      saves: Math.floor(Math.random() * 300) + 50,
      reach,
      impressions: reach + Math.floor(Math.random() * 4000),
      caption: captions[i],
      media_url: `https://picsum.photos/seed/${i + 1}/640/640`,
      posted_at: date.toISOString(),
    });
  }

  return posts;
}

// Generate mock dashboard summary
function generateMockSummary(): DashboardSummary {
  return {
    total_followers: 14250,
    followers_change: 320,
    engagement_rate: 4.7,
    engagement_change: 0.3,
    posts_this_week: 5,
    scheduled_posts: 3,
  };
}

export async function GET(request: Request) {
  try {
    // Verify user is authenticated
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'summary'; // summary | daily | posts
    const days = parseInt(searchParams.get('days') || '30', 10);

    switch (type) {
      case 'summary': {
        const summary = generateMockSummary();
        return NextResponse.json({ data: summary });
      }

      case 'daily': {
        const clampedDays = Math.min(Math.max(days, 7), 90);
        const analytics = generateMockDailyAnalytics(clampedDays);
        return NextResponse.json({ data: analytics });
      }

      case 'posts': {
        const postAnalytics = generateMockPostAnalytics();
        return NextResponse.json({ data: postAnalytics });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid analytics type. Use: summary, daily, or posts' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
