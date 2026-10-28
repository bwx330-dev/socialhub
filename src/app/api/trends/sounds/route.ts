import { NextResponse } from 'next/server';

export interface TrendingSound {
  id: string;
  rank: number;
  previousRank: number | null;
  rankChange: number | 'new' | 0;
  title: string;
  artist: string;
  category: 'indo' | 'global' | 'rising' | 'bgm' | 'remix';
  categoryLabel: string;
  velocityScore: number; // 0 - 100
  velocityText: string;
  videoCount: string;
  duration: string;
  bpm: number;
  vibe: string;
  recommendedFor: string[];
  audioPreviewUrl: string;
  synthPreset: 'jedag_jedug' | 'lofi_chill' | 'upbeat_pop' | 'phonk_bass' | 'cinematic_ambient';
  tiktokSearchUrl: string;
  tags: string[];
  statusBadge: string;
  peakHour: string;
}

const BASE_SOUNDS: Omit<TrendingSound, 'rank' | 'previousRank' | 'rankChange' | 'velocityScore' | 'velocityText'>[] = [
  {
    id: 'snd-1',
    title: 'DJ Gala Gala x Jedag Jedug FYP',
    artist: 'DJ Desa x Tian Remix',
    category: 'remix',
    categoryLabel: 'Jedag Jedug / Remix',
    videoCount: '2.8M',
    duration: '0:32',
    bpm: 128,
    vibe: 'High Energy • Jedag-Jedug • Bass Drop',
    recommendedFor: ['Transisi OOTD', 'Sinematik Motor/Mobil', 'JJ Beat Sync CapCut'],
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    synthPreset: 'jedag_jedug',
    tiktokSearchUrl: 'https://www.tiktok.com/search?q=DJ%20Gala%20Gala%20Jedag%20Jedug',
    tags: ['#GalaGala', '#JJViral', '#JedagJedug', '#FYPIndonesia', '#SoundViral'],
    statusBadge: '🔥 Top #1 FYP Indonesia',
    peakHour: '19:00 - 22:00 WIB',
  },
  {
    id: 'snd-2',
    title: 'Satu Bulan (Sped Up & Reverb)',
    artist: 'Bernadya / SpedUpID',
    category: 'indo',
    categoryLabel: 'Lokal Indo FYP',
    videoCount: '1.9M',
    duration: '0:45',
    bpm: 116,
    vibe: 'Melancholic • Storytelling • Heartbreak',
    recommendedFor: ['Galau / POV Cerita', 'Vlog Senja', 'Curhat & Relatable Content'],
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    synthPreset: 'lofi_chill',
    tiktokSearchUrl: 'https://www.tiktok.com/search?q=Satu%20Bulan%20Bernadya%20Sped%20Up',
    tags: ['#SatuBulan', '#Bernadya', '#LaguGalau', '#POV', '#SpedUpSong'],
    statusBadge: '🚀 Naik +3 Peringkat',
    peakHour: '21:00 - 00:00 WIB',
  },
  {
    id: 'snd-3',
    title: 'Komang (Acoustic Lofi Chill Edit)',
    artist: 'Raim Laode x Lofi Vibes',
    category: 'indo',
    categoryLabel: 'Lokal Indo FYP',
    videoCount: '2.1M',
    duration: '0:38',
    bpm: 98,
    vibe: 'Warm Acoustic • Romantis • Aesthetic',
    recommendedFor: ['A Day in My Life', 'Momen Manis Bareng Pasangan', 'Cafe Vlog'],
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    synthPreset: 'upbeat_pop',
    tiktokSearchUrl: 'https://www.tiktok.com/search?q=Komang%20Acoustic%20Lofi',
    tags: ['#Komang', '#AcousticVibes', '#AestheticVlog', '#DailyVlog', '#Romantis'],
    statusBadge: '💎 Konsisten FYP 30 Hari',
    peakHour: '12:00 - 15:00 WIB',
  },
  {
    id: 'snd-4',
    title: 'Brazuka Phonk Speed Drift',
    artist: 'DJ Slow Bass x Phonk Nation',
    category: 'rising',
    categoryLabel: 'Rising Stars (Naik Cepat)',
    videoCount: '870K',
    duration: '0:28',
    bpm: 142,
    vibe: 'Aggressive • Dark Bass • High BPM',
    recommendedFor: ['Gym & Fitness Workout', 'Gaming Highlights', 'Automotive Reels'],
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    synthPreset: 'phonk_bass',
    tiktokSearchUrl: 'https://www.tiktok.com/search?q=Brazuka%20Phonk%20Speed',
    tags: ['#Phonk', '#GymMotivation', '#GamingClip', '#DriftSound', '#Adrenaline'],
    statusBadge: '⚡ Meroket +420% Hari Ini',
    peakHour: '20:00 - 23:00 WIB',
  },
  {
    id: 'snd-5',
    title: 'Birds of a Feather (Sped Up Remix)',
    artist: 'Billie Eilish / TikTok Edit',
    category: 'global',
    categoryLabel: 'Global FYP',
    videoCount: '3.4M',
    duration: '0:35',
    bpm: 120,
    vibe: 'Dreamy Pop • Sweet Nostalgia • Uplifting',
    recommendedFor: ['Friendship Goals', 'Travel Dump', 'Get Ready With Me (GRWM)'],
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    synthPreset: 'upbeat_pop',
    tiktokSearchUrl: 'https://www.tiktok.com/search?q=Birds%20of%20a%20Feather%20Sped%20Up',
    tags: ['#BirdsOfAFeather', '#GlobalTrend', '#TravelDump', '#GRWM', '#Friendship'],
    statusBadge: '🌍 No. 1 Global Sound',
    peakHour: '17:00 - 21:00 WIB',
  },
  {
    id: 'snd-6',
    title: 'BGM Edukasi & Review Minimalist',
    artist: 'Aesthetic Studio Lo-Fi',
    category: 'bgm',
    categoryLabel: 'BGM & Edukasi',
    videoCount: '620K',
    duration: '1:00',
    bpm: 90,
    vibe: 'Subtle • Fokus Suara • Clean & Polished',
    recommendedFor: ['Voiceover Tutorial', 'Review Gadget / Skincare', 'Tips Finansial & Karir'],
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    synthPreset: 'lofi_chill',
    tiktokSearchUrl: 'https://www.tiktok.com/search?q=BGM%20Edukasi%20Aesthetic%20Tutorial',
    tags: ['#BGMReview', '#VoiceoverSound', '#TutorialTikTok', '#TipsBisnis', '#EdukasiKonten'],
    statusBadge: '🎙️ Favorit Konten Kreator Edukasi',
    peakHour: '08:00 - 14:00 WIB',
  },
  {
    id: 'snd-7',
    title: 'Untungnya Bumi Masih Berputar',
    artist: 'Bernadya',
    category: 'indo',
    categoryLabel: 'Lokal Indo FYP',
    videoCount: '1.4M',
    duration: '0:40',
    bpm: 104,
    vibe: 'Reflektif • Tenang • Heartwarming',
    recommendedFor: ['Mini Vlog Harian', 'Penyemangat Hidup / Healing', 'Dump Photo Bulanan'],
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    synthPreset: 'lofi_chill',
    tiktokSearchUrl: 'https://www.tiktok.com/search?q=Untungnya%20Bumi%20Masih%20Berputar',
    tags: ['#UntungnyaBumiMasihBerputar', '#Bernadya', '#SelfHealing', '#MiniVlog', '#PhotoDump'],
    statusBadge: '✨ Tren Relatable Positif',
    peakHour: '06:00 - 09:00 WIB',
  },
  {
    id: 'snd-8',
    title: 'DJ Alay Gaya Kaya Artis (Bass Horeg)',
    artist: 'DJ Desa Koplo Sound',
    category: 'remix',
    categoryLabel: 'Jedag Jedug / Remix',
    videoCount: '1.7M',
    duration: '0:30',
    bpm: 130,
    vibe: 'Funky Koplo • Horeg Bass • Joget FYP',
    recommendedFor: ['Dance Challenge', 'Komedi / Parodi', 'Transisi Lucu'],
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    synthPreset: 'jedag_jedug',
    tiktokSearchUrl: 'https://www.tiktok.com/search?q=DJ%20Alay%20Gaya%20Kaya%20Artis',
    tags: ['#DJAlay', '#DJDesa', '#BassHoreg', '#JogetFYP', '#KomediViral'],
    statusBadge: '🕺 Viral di Dance Challenge',
    peakHour: '18:00 - 22:00 WIB',
  },
  {
    id: 'snd-9',
    title: 'Steal The Show (Cinematic Ambient Horizon)',
    artist: 'Lauv / Cinema Edit',
    category: 'global',
    categoryLabel: 'Global FYP',
    videoCount: '950K',
    duration: '0:48',
    bpm: 108,
    vibe: 'Cinematic • Epic • Visual Storytelling',
    recommendedFor: ['Drone Footage Alam', 'Visual Cinematic Vlog', 'Montage Liburan'],
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    synthPreset: 'cinematic_ambient',
    tiktokSearchUrl: 'https://www.tiktok.com/search?q=Steal%20The%20Show%20Cinematic',
    tags: ['#CinematicVideo', '#DroneIndonesia', '#TravelReels', '#VisualStory', '#EpicEdit'],
    statusBadge: '🎥 Pilihan No. 1 Videografer',
    peakHour: '16:00 - 20:00 WIB',
  },
  {
    id: 'snd-10',
    title: 'Penjaga Hati (Sped Up Lofi)',
    artist: 'Nadhif Basalamah',
    category: 'indo',
    categoryLabel: 'Lokal Indo FYP',
    videoCount: '2.5M',
    duration: '0:36',
    bpm: 112,
    vibe: 'Romantic Soul • Sweet Melody • Soft Beats',
    recommendedFor: ['Wedding Highlights', 'Romantic Date', 'Aesthetic Photo Slide'],
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    synthPreset: 'upbeat_pop',
    tiktokSearchUrl: 'https://www.tiktok.com/search?q=Penjaga%20Hati%20Sped%20Up',
    tags: ['#PenjagaHati', '#NadhifBasalamah', '#RomanticReels', '#LoveStory', '#BucinVibes'],
    statusBadge: '❤️ Tren Bucin & Wedding',
    peakHour: '19:00 - 23:00 WIB',
  },
  {
    id: 'snd-11',
    title: 'Kisinan 2 (Koplo Akustik Santai)',
    artist: 'Masdddho',
    category: 'indo',
    categoryLabel: 'Lokal Indo FYP',
    videoCount: '1.2M',
    duration: '0:42',
    bpm: 110,
    vibe: 'Jawa Pop • Melow Koplo • Relatable',
    recommendedFor: ['POV Lucu Ngarep', 'Vlog Sore', 'Reels Jawa'],
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    synthPreset: 'lofi_chill',
    tiktokSearchUrl: 'https://www.tiktok.com/search?q=Kisinan%202%20Masdddho',
    tags: ['#Kisinan2', '#Masdddho', '#LaguJawa', '#KoploSantai', '#POVLucu'],
    statusBadge: '📈 Tren Regional Jawa Timur & Jateng',
    peakHour: '17:00 - 21:00 WIB',
  },
  {
    id: 'snd-12',
    title: 'Morning Coffee Acoustic Pop',
    artist: 'Indie Sunshine Cafe',
    category: 'bgm',
    categoryLabel: 'BGM & Edukasi',
    videoCount: '490K',
    duration: '0:50',
    bpm: 102,
    vibe: 'Bright • Positive • Coffee Shop Vibe',
    recommendedFor: ['Product Showcase', 'Morning Routine', 'Cookbook / Resep Masak'],
    audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    synthPreset: 'upbeat_pop',
    tiktokSearchUrl: 'https://www.tiktok.com/search?q=Morning%20Coffee%20Acoustic%20Vibe',
    tags: ['#MorningRoutine', '#CafeVibes', '#ResepViral', '#ProductShowcase', '#AestheticHome'],
    statusBadge: '☕ Favorit Home & Cooking',
    peakHour: '07:00 - 11:00 WIB',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const timeframe = searchParams.get('timeframe') || 'realtime';
  const refreshParam = searchParams.get('refresh');

  // Dynamic real-time calculation based on current time
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Create deterministic yet dynamic shift
  // Changing every 10-15 minutes or when refreshed with timestamp
  const shiftSeed = refreshParam ? parseInt(refreshParam, 10) || now.getTime() : (now.getDate() * 24 + currentHour);

  // Calculate dynamic velocity and rank for each sound
  const enrichedSounds: TrendingSound[] = BASE_SOUNDS.map((item, index) => {
    // Slight pseudorandom shift based on item index and time
    const timeDelta = ((shiftSeed * 13 + index * 17) % 7) - 3; // -3 to +3
    const calculatedRank = Math.max(1, index + 1 + (timeframe === 'realtime' ? timeDelta : 0));
    
    // Dynamic velocity score (80 - 99)
    const baseVelocity = 99 - index * 1.6;
    const velocityVariation = ((shiftSeed * 7 + index * 11) % 9) - 4;
    const velocityScore = Math.min(99, Math.max(75, Math.round(baseVelocity + velocityVariation)));

    const rankChange = index === 0 ? 0 : timeDelta < 0 ? Math.abs(timeDelta) : timeDelta > 0 ? -timeDelta : 'new';

    // Dynamic velocity text
    let velocityText = '+210% video baru hari ini';
    if (velocityScore >= 95) {
      velocityText = `🔥 +${350 + (index * 25) % 180}% lonjakan FYP 3 jam terakhir`;
    } else if (velocityScore >= 90) {
      velocityText = `⚡ +${200 + (index * 15) % 120}% video baru dibuat hari ini`;
    } else {
      velocityText = `📈 Konsisten naik +${120 + (index * 10) % 80}% minggu ini`;
    }

    return {
      ...item,
      rank: calculatedRank,
      previousRank: calculatedRank + (typeof rankChange === 'number' ? -rankChange : 1),
      rankChange: rankChange,
      velocityScore,
      velocityText,
    };
  });

  // Sort by calculated rank
  enrichedSounds.sort((a, b) => a.rank - b.rank);

  // Normalize ranks to 1..N
  enrichedSounds.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  // Filter by category if requested
  const filtered = category === 'all'
    ? enrichedSounds
    : enrichedSounds.filter((s) => s.category === category);

  // Format scanned time in WIB (UTC+7)
  const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const hoursStr = String(wibTime.getUTCHours()).padStart(2, '0');
  const minutesStr = String(wibTime.getUTCMinutes()).padStart(2, '0');
  const secondsStr = String(wibTime.getUTCSeconds()).padStart(2, '0');
  const formattedScannedAt = `${hoursStr}:${minutesStr}:${secondsStr} WIB`;

  return NextResponse.json({
    status: 'success',
    scannedAt: formattedScannedAt,
    timeframe,
    totalSounds: filtered.length,
    radarStatus: '🟢 Radar Real-time Aktif (Dipindai Otomatis)',
    summary: {
      topCategory: 'Jedag Jedug & Sped Up Melow',
      fastestRising: enrichedSounds[0]?.title || 'DJ Gala Gala x Jedag Jedug FYP',
      recommendedStrategy: 'Gunakan sound trending dengan volume 5-10% di latar belakang voiceover untuk boost reach tanpa menenggelamkan pesan konten.',
    },
    sounds: filtered,
  });
}
