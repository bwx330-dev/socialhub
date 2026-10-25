// ============================================================
// Ayrshare API Client
// Docs: https://docs.ayrshare.com
// ============================================================

const AYRSHARE_API = 'https://app.ayrshare.com/api';

export class AyrshareAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Post to one or more platforms
   */
  async post(params: {
    post: string;
    platforms: string[];
    mediaUrls?: string[];
    scheduleDate?: string; // ISO 8601 date for scheduled posts
    hashtags?: string[];
  }) {
    const body: Record<string, unknown> = {
      post: params.post,
      platforms: params.platforms,
    };

    if (params.mediaUrls && params.mediaUrls.length > 0) {
      body.mediaUrls = params.mediaUrls;
    }

    if (params.scheduleDate) {
      body.scheduleDate = params.scheduleDate;
    }

    // Append hashtags to post text if provided
    if (params.hashtags && params.hashtags.length > 0) {
      body.post = `${params.post}\n\n${params.hashtags.map(h => `#${h}`).join(' ')}`;
    }

    const res = await fetch(`${AYRSHARE_API}/post`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    return res.json();
  }

  /**
   * Delete a post by ID
   */
  async deletePost(postId: string) {
    const res = await fetch(`${AYRSHARE_API}/post`, {
      method: 'DELETE',
      headers: this.headers(),
      body: JSON.stringify({ id: postId }),
    });
    return res.json();
  }

  /**
   * Get post history
   */
  async getHistory(platform?: string) {
    const url = platform
      ? `${AYRSHARE_API}/history?platform=${platform}`
      : `${AYRSHARE_API}/history`;

    const res = await fetch(url, {
      method: 'GET',
      headers: this.headers(),
    });
    return res.json();
  }

  /**
   * Get analytics for a specific post
   */
  async getAnalytics(postId: string, platforms: string[]) {
    const res = await fetch(`${AYRSHARE_API}/analytics/post`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ id: postId, platforms }),
    });
    return res.json();
  }

  /**
   * Get account analytics / user info
   */
  async getUser() {
    const res = await fetch(`${AYRSHARE_API}/user`, {
      method: 'GET',
      headers: this.headers(),
    });
    return res.json();
  }

  /**
   * Get connected social accounts info
   */
  async getProfiles() {
    const res = await fetch(`${AYRSHARE_API}/profiles`, {
      method: 'GET',
      headers: this.headers(),
    });
    return res.json();
  }

  /**
   * Generate link to Ayrshare's social account connection page
   * (User connects IG/TikTok/etc on Ayrshare's UI — no OAuth headaches)
   */
  static getConnectUrl(): string {
    return 'https://app.ayrshare.com/dashboard/social-accounts';
  }
}

/**
 * Check if Ayrshare is configured
 */
export function isAyrshareConfigured(): boolean {
  return !!process.env.AYRSHARE_API_KEY;
}

/**
 * Get the singleton Ayrshare client (or null if not configured)
 */
export function getAyrshareClient(): AyrshareAPI | null {
  const key = process.env.AYRSHARE_API_KEY;
  if (!key) return null;
  return new AyrshareAPI(key);
}
