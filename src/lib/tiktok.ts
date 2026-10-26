const TIKTOK_API = 'https://open.tiktokapis.com/v2';

export class TikTokAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private headers() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async getUserInfo() {
    // Only request scopes authorized by TikTok Login Kit & User Info Stats
    // Do NOT include bio_description or is_verified which trigger scope_not_authorized
    const fields = 'open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count';
    try {
      const res = await fetch(`${TIKTOK_API}/user/info/?fields=${fields}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        cache: 'no-store',
      });
      const data = await res.json();

      // If scope_not_authorized happens, fallback to basic profile info
      if (data?.error?.code === 'scope_not_authorized') {
        const basicFields = 'open_id,union_id,avatar_url,display_name';
        const fallbackRes = await fetch(`${TIKTOK_API}/user/info/?fields=${basicFields}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
          cache: 'no-store',
        });
        return fallbackRes.json();
      }

      return data;
    } catch (err) {
      console.error('Error calling TikTok getUserInfo:', err);
      return { error: { code: 'fetch_failed', message: 'Failed to fetch user info from TikTok' } };
    }
  }

  async getVideos(cursor?: string, maxCount = 20) {
    const res = await fetch(`${TIKTOK_API}/video/list/`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        max_count: maxCount,
        cursor: cursor,
        fields: ['id', 'title', 'video_description', 'create_time', 'cover_image_url', 'share_url', 'like_count', 'comment_count', 'share_count', 'view_count', 'duration']
      }),
    });
    return res.json();
  }

  // Publish video via URL
  async initUpload(videoUrl: string, title: string) {
    const res = await fetch(`${TIKTOK_API}/post/publish/video/init/`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        post_info: {
          title: title,
          privacy_level: 'SELF_ONLY', // Start as private
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl,
        },
      }),
    });
    return res.json();
  }
}

export function getTikTokAuthUrl(clientKey: string, redirectUri: string) {
  const scopes = 'user.info.basic,user.info.stats,video.list,video.publish,video.upload';
  const csrfState = Math.random().toString(36).substring(2);
  return `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${scopes}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${csrfState}`;
}
