export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  platform: 'instagram' | 'tiktok';
  platform_user_id: string;
  username: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  profile_pic?: string;
  follower_count: number;
  following_count: number;
  post_count: number;
  is_active: boolean;
  created_at: string;
}

export interface ScheduledPost {
  id: string;
  user_id: string;
  account_id: string;
  platform: 'instagram' | 'tiktok';
  caption: string;
  hashtags: string[];
  media_url?: string;
  media_type: 'image' | 'video' | 'carousel';
  scheduled_at: string;
  status: 'pending' | 'published' | 'failed' | 'cancelled';
  published_at?: string;
  error_message?: string;
  created_at: string;
}

export interface AnalyticsData {
  date: string;
  followers: number;
  following: number;
  posts: number;
  likes: number;
  comments: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
}

export interface PostAnalytics {
  id: string;
  post_id: string;
  platform: 'instagram' | 'tiktok';
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  caption: string;
  media_url?: string;
  posted_at: string;
}

export interface DashboardSummary {
  total_followers: number;
  followers_change: number;
  engagement_rate: number;
  engagement_change: number;
  posts_this_week: number;
  scheduled_posts: number;
}
