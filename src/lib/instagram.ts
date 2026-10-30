// Instagram Graph API helper
// Docs: https://developers.facebook.com/docs/instagram-api

const IG_API = 'https://graph.facebook.com/v18.0';
const FB_API = 'https://graph.facebook.com/v18.0';

export class InstagramAPI {
  private accessToken: string;
  private userId: string;

  constructor(accessToken: string, userId: string) {
    this.accessToken = accessToken;
    this.userId = userId;
  }

  // Get user profile
  async getProfile() {
    const res = await fetch(
      `${IG_API}/${this.userId}?fields=id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url&access_token=${this.accessToken}`
    );
    return res.json();
  }

  // Get user media/posts
  async getMedia(limit = 25) {
    const res = await fetch(
      `${IG_API}/${this.userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${this.accessToken}`
    );
    return res.json();
  }

  // Get insights for a media
  async getMediaInsights(mediaId: string) {
    const res = await fetch(
      `${IG_API}/${mediaId}/insights?metric=engagement,impressions,reach,saved&access_token=${this.accessToken}`
    );
    return res.json();
  }

  // Get user insights (followers growth, etc)
  async getUserInsights(period: 'day' | 'week' | 'days_28' = 'day') {
    const res = await fetch(
      `${IG_API}/${this.userId}/insights?metric=follower_count,impressions,reach,profile_views&period=${period}&access_token=${this.accessToken}`
    );
    return res.json();
  }

  // Publish a photo post (requires Facebook Page + IG Business account)
  async publishPhoto(imageUrl: string, caption: string) {
    // Step 1: Create media container
    const createRes = await fetch(
      `${FB_API}/${this.userId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: this.accessToken,
        }),
      }
    );
    const { id: containerId } = await createRes.json();

    // Step 2: Publish
    const publishRes = await fetch(
      `${FB_API}/${this.userId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: this.accessToken,
        }),
      }
    );
    return publishRes.json();
  }

  // Publish a video/reel
  async publishVideo(videoUrl: string, caption: string, mediaType: 'REELS' | 'VIDEO' = 'REELS') {
    const createRes = await fetch(
      `${FB_API}/${this.userId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url: videoUrl,
          caption: caption,
          media_type: mediaType,
          access_token: this.accessToken,
        }),
      }
    );
    const { id: containerId } = await createRes.json();

    // Wait for processing
    let status = 'IN_PROGRESS';
    while (status === 'IN_PROGRESS') {
      await new Promise(r => setTimeout(r, 5000));
      const checkRes = await fetch(
        `${FB_API}/${containerId}?fields=status_code&access_token=${this.accessToken}`
      );
      const data = await checkRes.json();
      status = data.status_code;
    }

    const publishRes = await fetch(
      `${FB_API}/${this.userId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: this.accessToken,
        }),
      }
    );
    return publishRes.json();
  }
}

// OAuth URL generator
export function getInstagramAuthUrl(appId: string, redirectUri: string) {
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'pages_show_list',
    'pages_read_engagement',
  ].join(',');

  return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;
}

// Exchange code for token
export async function exchangeCodeForToken(code: string, appId: string, appSecret: string, redirectUri: string) {
  const res = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
  );
  return res.json();
}
