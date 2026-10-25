import { subDays, format, addDays, setHours } from 'date-fns';

// --- Followers Growth (30 days) ---
const today = new Date();
export const followersGrowthData = Array.from({ length: 30 }, (_, i) => {
  const date = subDays(today, 29 - i);
  return {
    date: format(date, 'dd MMM'),
    followers: 12400 + Math.floor(i * 85 + ((i * 37) % 180)),
  };
});

// --- Engagement by Post Type ---
export const engagementByType = [
  { type: 'Foto', likes: 3200, comments: 480, shares: 220 },
  { type: 'Video', likes: 5800, comments: 920, shares: 610 },
  { type: 'Reels', likes: 8400, comments: 1350, shares: 1100 },
  { type: 'Story', likes: 1900, comments: 150, shares: 80 },
];

// --- Summary Analytics ---
export const analyticsOverview = {
  totalFollowers: 14850,
  followersTrend: 5.2,
  engagementRate: 4.7,
  engagementTrend: 1.3,
  postsThisWeek: 12,
  postsTrend: -2,
  scheduledPosts: 8,
  scheduledTrend: 3,
};

// --- Scheduled Posts ---
export const scheduledPosts = [
  {
    id: '1',
    caption: 'Tips produktif untuk content creator! 🚀 #productivity #tips',
    platform: 'instagram' as const,
    scheduledDate: format(addDays(today, 1), 'yyyy-MM-dd'),
    scheduledTime: '09:00',
    status: 'scheduled' as const,
    mediaType: 'image' as const,
  },
  {
    id: '2',
    caption: 'Behind the scenes editing proses 🎬 #bts #editing',
    platform: 'tiktok' as const,
    scheduledDate: format(addDays(today, 1), 'yyyy-MM-dd'),
    scheduledTime: '14:00',
    status: 'scheduled' as const,
    mediaType: 'video' as const,
  },
  {
    id: '3',
    caption: 'Outfit of the day ✨ #ootd #fashion #style',
    platform: 'instagram' as const,
    scheduledDate: format(addDays(today, 2), 'yyyy-MM-dd'),
    scheduledTime: '11:00',
    status: 'scheduled' as const,
    mediaType: 'image' as const,
  },
  {
    id: '4',
    caption: 'Tutorial masak healthy meal prep 🥗 #cooking #mealprep',
    platform: 'tiktok' as const,
    scheduledDate: format(addDays(today, 3), 'yyyy-MM-dd'),
    scheduledTime: '18:00',
    status: 'scheduled' as const,
    mediaType: 'video' as const,
  },
  {
    id: '5',
    caption: 'Morning routine yang bikin semangat! ☀️ #morningroutine',
    platform: 'instagram' as const,
    scheduledDate: format(addDays(today, 4), 'yyyy-MM-dd'),
    scheduledTime: '07:00',
    status: 'scheduled' as const,
    mediaType: 'video' as const,
  },
  {
    id: '6',
    caption: 'Review skincare terbaru! 💆 #skincare #review',
    platform: 'instagram' as const,
    scheduledDate: format(today, 'yyyy-MM-dd'),
    scheduledTime: '20:00',
    status: 'scheduled' as const,
    mediaType: 'image' as const,
  },
  {
    id: '7',
    caption: 'Q&A session — tanya apa aja! 🎤 #qna #askme',
    platform: 'tiktok' as const,
    scheduledDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    scheduledTime: '16:00',
    status: 'scheduled' as const,
    mediaType: 'video' as const,
  },
  {
    id: '8',
    caption: 'Wisata alam tersembunyi di Indonesia 🏞️ #travel #nature',
    platform: 'instagram' as const,
    scheduledDate: format(addDays(today, 6), 'yyyy-MM-dd'),
    scheduledTime: '10:00',
    status: 'scheduled' as const,
    mediaType: 'image' as const,
  },
];

// --- Connected Accounts ---
export const connectedAccounts = [
  {
    id: '1',
    platform: 'instagram' as const,
    username: '@socialhub.official',
    status: 'connected' as const,
    followers: 14850,
    avatar: null,
  },
  {
    id: '2',
    platform: 'tiktok' as const,
    username: '@socialhub_id',
    status: 'connected' as const,
    followers: 8320,
    avatar: null,
  },
];

// --- Top Posts ---
export const topPosts = [
  {
    id: '1',
    caption: 'Tips & trick editing foto aesthetic ✨',
    platform: 'instagram' as const,
    likes: 2840,
    comments: 342,
    views: 18500,
    date: format(subDays(today, 2), 'dd MMM yyyy'),
  },
  {
    id: '2',
    caption: 'Tutorial transition smooth di TikTok 🎬',
    platform: 'tiktok' as const,
    likes: 5620,
    comments: 891,
    views: 45200,
    date: format(subDays(today, 3), 'dd MMM yyyy'),
  },
  {
    id: '3',
    caption: 'Day in my life sebagai content creator 📸',
    platform: 'instagram' as const,
    likes: 1960,
    comments: 218,
    views: 12400,
    date: format(subDays(today, 5), 'dd MMM yyyy'),
  },
  {
    id: '4',
    caption: 'Rekomendasi cafe aesthetic Jakarta ☕',
    platform: 'instagram' as const,
    likes: 3150,
    comments: 467,
    views: 22100,
    date: format(subDays(today, 7), 'dd MMM yyyy'),
  },
  {
    id: '5',
    caption: 'POV: pertama kali viral di TikTok 🔥',
    platform: 'tiktok' as const,
    likes: 12300,
    comments: 2100,
    views: 89000,
    date: format(subDays(today, 1), 'dd MMM yyyy'),
  },
];

// --- Best Time to Post heatmap data ---
const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

export const bestTimeData = days.flatMap((day, dayIdx) =>
  hours.map((hour) => {
    // Deterministic pseudo-random variation based on day and hour
    const seed = (dayIdx * 17 + hour * 31) % 25;
    let intensity = 10 + seed;

    // Peak times: weekdays 11-13 and 18-21
    if (dayIdx < 5) {
      if (hour >= 11 && hour <= 13) intensity += 45 + ((hour * 13) % 20);
      if (hour >= 18 && hour <= 21) intensity += 55 + ((hour * 19) % 25);
    }
    // Weekends: 9-12 and 19-22
    if (dayIdx >= 5) {
      if (hour >= 9 && hour <= 12) intensity += 40 + ((hour * 11) % 25);
      if (hour >= 19 && hour <= 22) intensity += 50 + ((hour * 17) % 20);
    }
    return {
      day,
      hour: `${hour}:00`,
      value: Math.min(Math.round(intensity), 100),
    };
  })
);

export { days as heatmapDays, hours as heatmapHours };
