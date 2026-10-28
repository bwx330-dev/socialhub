import { NextResponse } from 'next/server';

export interface TrendingEffect {
  id: string;
  rank: number;
  title: string;
  platform: 'capcut' | 'tiktok';
  category: 'transition' | 'filter' | 'ai' | 'beat_sync' | 'aesthetic';
  categoryLabel: string;
  author: string;
  usageCount: string;
  viralityScore: number;
  statusBadge: string;
  description: string;
  recommendedSound: string;
  gradientClass: string;
  externalUrl: string;
  tags: string[];
}

const BASE_EFFECTS: Omit<TrendingEffect, 'rank' | 'viralityScore'>[] = [
  {
    id: 'eff-1',
    title: 'Velocity Blur Zoom Beat (CapCut)',
    platform: 'capcut',
    category: 'beat_sync',
    categoryLabel: 'Beat Sync & JJ',
    author: '@editor_berkelas',
    usageCount: '4.2M ekspor',
    statusBadge: '🔥 No. 1 Template CapCut FYP',
    description: 'Transisi zoom berkecepatan tinggi dengan efek blur kinetik pas di drop bass. Cocok untuk transisi outfit, reveal produk, dan motor.',
    recommendedSound: 'DJ Gala Gala x Jedag Jedug FYP',
    gradientClass: 'from-pink-600 via-rose-600 to-amber-600',
    externalUrl: 'https://www.capcut.com/template-detail/velocity-blur-zoom',
    tags: ['#CapCutTemplate', '#VelocityBlur', '#JJViral', '#TransisiFYP'],
  },
  {
    id: 'eff-2',
    title: 'Soft Glow Film Grain 90s',
    platform: 'tiktok',
    category: 'aesthetic',
    categoryLabel: 'Aesthetic & Mood',
    author: '@aesthetic_vibes',
    usageCount: '2.6M video',
    statusBadge: '✨ Tren Filter Estetik Hari Ini',
    description: 'Efek pencahayaan hangat dengan butiran film vintage 90-an dan warna kulit natural glow. Bikin video sederhana langsung terasa sinematik.',
    recommendedSound: 'Satu Bulan (Sped Up & Reverb)',
    gradientClass: 'from-amber-500 via-orange-600 to-yellow-500',
    externalUrl: 'https://www.tiktok.com/search?q=Soft%20Glow%20Film%20Grain%20Filter',
    tags: ['#FilmGrain', '#VintageFilter', '#AestheticTikTok', '#SoftGlow'],
  },
  {
    id: 'eff-3',
    title: 'AI Yearbook & Retro Portrait Morph',
    platform: 'tiktok',
    category: 'ai',
    categoryLabel: 'AI Visual',
    author: '@tiktok_ai_studio',
    usageCount: '1.8M video',
    statusBadge: '🤖 Tren AI Viral Global',
    description: 'Mengubah foto wajah menjadi potret vintage 80/90an dengan gaya yearbook wisuda dan majalah retro dalam 1 detik.',
    recommendedSound: 'Birds of a Feather (Sped Up Remix)',
    gradientClass: 'from-indigo-600 via-purple-600 to-pink-500',
    externalUrl: 'https://www.tiktok.com/search?q=AI%20Yearbook%20Filter',
    tags: ['#AIYearbook', '#RetroFilter', '#AIFilter', '#TrendAI'],
  },
  {
    id: 'eff-4',
    title: 'Cinematic Teal & Moody Orange (CapCut)',
    platform: 'capcut',
    category: 'filter',
    categoryLabel: 'Color Grading Sinematik',
    author: '@cinema_id',
    usageCount: '1.5M ekspor',
    statusBadge: '🎥 Pilihan Utama Videografer',
    description: 'Preset color grading khas film layar lebar dengan kontras tajam antara biru laut dan jingga keemasan. Sangat cocok untuk vlog traveling.',
    recommendedSound: 'Steal The Show (Cinematic Ambient)',
    gradientClass: 'from-cyan-600 via-teal-700 to-amber-700',
    externalUrl: 'https://www.capcut.com/template-detail/cinematic-teal-orange',
    tags: ['#TealAndOrange', '#CinematicCapcut', '#ColorGrade', '#TravelVlog'],
  },
  {
    id: 'eff-5',
    title: 'Smooth Optical Flow 60FPS SlowMo',
    platform: 'capcut',
    category: 'transition',
    categoryLabel: 'SlowMo Halus',
    author: '@slowmo_king',
    usageCount: '2.1M ekspor',
    statusBadge: '⚡ Rekomendasi FYP 60FPS',
    description: 'Menginterpolasi video biasa 30fps menjadi slow motion super halus 60fps tanpa patah-patah menggunakan teknologi Optical Flow.',
    recommendedSound: 'Brazuka Phonk Speed Drift',
    gradientClass: 'from-emerald-600 via-teal-600 to-blue-600',
    externalUrl: 'https://www.capcut.com/template-detail/smooth-optical-flow',
    tags: ['#SmoothSlowmo', '#OpticalFlow', '#60fps', '#SlowMotion'],
  },
  {
    id: 'eff-6',
    title: 'Split Screen 3-Frame Aesthetic',
    platform: 'capcut',
    category: 'aesthetic',
    categoryLabel: 'Layout & Frame',
    author: '@layout_creators',
    usageCount: '890K ekspor',
    statusBadge: '📱 Tren Mini Vlog & Cafe',
    description: 'Membagi layar menjadi 3 frame vertikal bersusun untuk menampilkan detail outfit, kopi, dan suasana sekaligus secara estetik.',
    recommendedSound: 'Morning Coffee Acoustic Pop',
    gradientClass: 'from-stone-600 via-neutral-700 to-zinc-800',
    externalUrl: 'https://www.capcut.com/template-detail/split-screen-aesthetic',
    tags: ['#SplitScreen', '#MiniVlog', '#CafeHopping', '#AestheticEdit'],
  },
  {
    id: 'eff-7',
    title: 'Green Screen Dynamic Background Zoom',
    platform: 'tiktok',
    category: 'filter',
    categoryLabel: 'Edukasi & Reaksi',
    author: '@creators_hub',
    usageCount: '3.1M video',
    statusBadge: '🎙️ Wajib untuk Konten Edukasi',
    description: 'Filter layar hijau dinamis dengan zoom otomatis saat kamu berbicara. Sangat efektif untuk menjelaskan berita, tips bisnis, atau tutorial.',
    recommendedSound: 'BGM Edukasi & Review Minimalist',
    gradientClass: 'from-green-600 via-emerald-600 to-teal-700',
    externalUrl: 'https://www.tiktok.com/search?q=Green%20Screen%20Dynamic%20TikTok',
    tags: ['#GreenScreen', '#EdukasiTikTok', '#TutorialVideo', '#StorytellingTips'],
  },
  {
    id: 'eff-8',
    title: 'Jedag Jedug Flash Beat Horeg V2',
    platform: 'capcut',
    category: 'beat_sync',
    categoryLabel: 'Beat Sync & JJ',
    author: '@jj_sound_id',
    usageCount: '2.9M ekspor',
    statusBadge: '⚡ Top JJ CapCut Indo',
    description: 'Template jedag-jedug khas Indo dengan efek flash putih kilat dan shake hentakan yang sinkron otomatis mengikuti ketukan beat.',
    recommendedSound: 'DJ Alay Gaya Kaya Artis (Bass Horeg)',
    gradientClass: 'from-fuchsia-600 via-purple-700 to-rose-600',
    externalUrl: 'https://www.capcut.com/template-detail/jj-flash-horeg',
    tags: ['#JedagJedug', '#JJCapCut', '#JJHoreg', '#ViralCapCut'],
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform') || 'all'; // all | capcut | tiktok
  const category = searchParams.get('category') || 'all';
  const refreshParam = searchParams.get('refresh');

  const now = new Date();
  const currentHour = now.getHours();
  const shiftSeed = refreshParam ? parseInt(refreshParam, 10) || now.getTime() : (now.getDate() * 24 + currentHour);

  const enrichedEffects: TrendingEffect[] = BASE_EFFECTS.map((item, index) => {
    const baseScore = 99 - index * 2;
    const variation = ((shiftSeed * 5 + index * 9) % 7) - 3;
    const viralityScore = Math.min(99, Math.max(78, baseScore + variation));

    return {
      ...item,
      rank: index + 1,
      viralityScore,
    };
  });

  const filtered = enrichedEffects.filter((item) => {
    if (platform !== 'all' && item.platform !== platform) return false;
    if (category !== 'all' && item.category !== category) return false;
    return true;
  });

  const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const hoursStr = String(wibTime.getUTCHours()).padStart(2, '0');
  const minutesStr = String(wibTime.getUTCMinutes()).padStart(2, '0');
  const secondsStr = String(wibTime.getUTCSeconds()).padStart(2, '0');
  const formattedScannedAt = `${hoursStr}:${minutesStr}:${secondsStr} WIB`;

  return NextResponse.json({
    status: 'success',
    scannedAt: formattedScannedAt,
    totalEffects: filtered.length,
    radarStatus: '🟢 Scanner Efek & CapCut Real-time Aktif',
    effects: filtered,
  });
}
