'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Music2,
  Disc3,
  Play,
  Pause,
  Sparkles,
  Flame,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Radio,
  Headphones,
  Sliders,
  Wand2,
  Video,
  Layers,
  Share2,
  Check,
  Copy,
  Volume2,
  VolumeX,
  Search,
  ArrowUpRight,
  Info,
  Clock,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import type { TrendingSound } from '@/app/api/trends/sounds/route';
import type { TrendingEffect } from '@/app/api/trends/effects/route';

export default function SoundsEffectsRadarPage() {
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<'sounds' | 'effects' | 'guide'>('sounds');

  // Sounds State
  const [sounds, setSounds] = useState<TrendingSound[]>([]);
  const [soundCategory, setSoundCategory] = useState<string>('all');
  const [soundSearch, setSoundSearch] = useState<string>('');
  const [isLoadingSounds, setIsLoadingSounds] = useState<boolean>(true);

  // Effects State
  const [effects, setEffects] = useState<TrendingEffect[]>([]);
  const [effectPlatform, setEffectPlatform] = useState<string>('all');
  const [effectCategory, setEffectCategory] = useState<string>('all');
  const [isLoadingEffects, setIsLoadingEffects] = useState<boolean>(true);

  // Real-Time Radar State
  const [scannedAt, setScannedAt] = useState<string>('11:00:00 WIB');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [autoScanEnabled, setAutoScanEnabled] = useState<boolean>(true);
  const [summaryInfo, setSummaryInfo] = useState<{
    topCategory: string;
    fastestRising: string;
    recommendedStrategy: string;
  }>({
    topCategory: 'Jedag Jedug & Sped Up Melow',
    fastestRising: 'DJ Gala Gala x Jedag Jedug FYP',
    recommendedStrategy:
      'Gunakan sound trending dengan volume 5-10% di latar belakang voiceover Anda untuk boost reach algoritma tanpa menenggelamkan penjelasan.',
  });

  // Audio Player State
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthOscRef = useRef<OscillatorNode | null>(null);

  // Fetch Sounds
  const fetchSounds = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsScanning(true);
      else setIsLoadingSounds(true);

      const refreshParam = isManualRefresh ? `&refresh=${Date.now()}` : '';
      const res = await fetch(`/api/trends/sounds?category=${soundCategory}${refreshParam}`);
      const data = await res.json();

      if (data.sounds) {
        setSounds(data.sounds);
        if (data.scannedAt) setScannedAt(data.scannedAt);
        if (data.summary) setSummaryInfo(data.summary);
      }
      if (isManualRefresh) {
        toast.success(`Radar diperbarui! ${data.sounds?.length || 12} audio viral terdeteksi`, {
          icon: '⚡',
        });
      }
    } catch {
      toast.error('Gagal memindai tren sound');
    } finally {
      setIsLoadingSounds(false);
      setIsScanning(false);
    }
  };

  // Fetch Effects
  const fetchEffects = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsScanning(true);
      else setIsLoadingEffects(true);

      const refreshParam = isManualRefresh ? `&refresh=${Date.now()}` : '';
      const res = await fetch(
        `/api/trends/effects?platform=${effectPlatform}&category=${effectCategory}${refreshParam}`
      );
      const data = await res.json();

      if (data.effects) {
        setEffects(data.effects);
        if (data.scannedAt) setScannedAt(data.scannedAt);
      }
      if (isManualRefresh) {
        toast.success(`Scanner efek diperbarui! ${data.effects?.length || 8} template siap pakai`, {
          icon: '🎬',
        });
      }
    } catch {
      toast.error('Gagal memindai tren efek');
    } finally {
      setIsLoadingEffects(false);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchSounds();
  }, [soundCategory]);

  useEffect(() => {
    fetchEffects();
  }, [effectPlatform, effectCategory]);

  // Periodic Auto-Scanner (every 60 seconds)
  useEffect(() => {
    if (!autoScanEnabled) return;
    const interval = setInterval(() => {
      fetchSounds(false);
      fetchEffects(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [autoScanEnabled, soundCategory, effectPlatform, effectCategory]);

  // Synthesize rhythmic preview if audio file is interrupted or blocked
  const playSynthPreview = (preset: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Stop previous osc
      if (synthOscRef.current) {
        try {
          synthOscRef.current.stop();
          synthOscRef.current.disconnect();
        } catch {}
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freqMap: Record<string, number> = {
        jedag_jedug: 130.81, // C3 bass
        lofi_chill: 261.63, // C4
        upbeat_pop: 329.63, // E4
        phonk_bass: 65.41, // C2 deep sub
        cinematic_ambient: 196.0, // G3
      };

      osc.type = preset === 'phonk_bass' ? 'sawtooth' : preset === 'jedag_jedug' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freqMap[preset] || 220, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      synthOscRef.current = osc;

      setTimeout(() => {
        try {
          osc.stop();
        } catch {}
      }, 1800);
    } catch {}
  };

  const handleTogglePlay = (sound: TrendingSound) => {
    if (currentPlayingId === sound.id && isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setCurrentPlayingId(null);
    } else {
      setCurrentPlayingId(sound.id);
      setIsPlaying(true);

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      audio.src = sound.audioPreviewUrl;
      audio.muted = isMuted;

      audio
        .play()
        .then(() => {
          // Playing fine
        })
        .catch(() => {
          // Play synth rhythmic preview fallback
          playSynthPreview(sound.synthPreset);
        });

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
      };
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (synthOscRef.current) {
      try {
        synthOscRef.current.stop();
      } catch {}
    }
    setIsPlaying(false);
    setCurrentPlayingId(null);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  // Copy sound title
  const handleCopyTitle = (title: string, id: string) => {
    navigator.clipboard.writeText(title);
    setCopiedId(id);
    toast.success(`"${title}" disalin ke clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Use in Post Composer
  const handleUseInPost = (sound: TrendingSound) => {
    handleStopAudio();
    const captionSnippet = `🎵 Sound: ${sound.title}\n\n[Tulis hook & cerita konten Anda di sini...]\n\n`;
    sessionStorage.setItem('socialhub_draft_caption', captionSnippet);
    sessionStorage.setItem('socialhub_draft_tags', JSON.stringify(sound.tags));
    sessionStorage.setItem(
      'socialhub_draft_audio',
      JSON.stringify({
        id: sound.id,
        title: sound.title,
        artist: sound.artist,
        tags: sound.tags,
      })
    );
    toast.success('Sound & hashtag ditransfer ke editor!', { icon: '🚀' });
    router.push('/dashboard/post');
  };

  // Use Effect in Post Composer
  const handleUseEffectInPost = (effect: TrendingEffect) => {
    handleStopAudio();
    const captionSnippet = `🎬 Template/Efek: ${effect.title} (${effect.platform.toUpperCase()})\n🎵 Rekomendasi Musik: ${effect.recommendedSound}\n\n[Tulis hook & caption Anda...]\n\n`;
    sessionStorage.setItem('socialhub_draft_caption', captionSnippet);
    sessionStorage.setItem('socialhub_draft_tags', JSON.stringify(effect.tags));
    toast.success('Rekomendasi efek ditransfer ke editor!', { icon: '✨' });
    router.push('/dashboard/post');
  };

  // Filter sounds by search
  const filteredSounds = sounds.filter((s) => {
    if (!soundSearch) return true;
    const query = soundSearch.toLowerCase();
    return (
      s.title.toLowerCase().includes(query) ||
      s.artist.toLowerCase().includes(query) ||
      s.vibe.toLowerCase().includes(query) ||
      s.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Real-time Radar Status Banner */}
      <Card className="relative overflow-hidden border border-pink-500/30 bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-900/90 p-5 shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 -mb-8 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Radar Real-Time FYP Aktif
              </span>
              <Badge variant="info" className="border-pink-500/40 bg-pink-500/10 text-pink-300 text-xs">
                TikTok & CapCut FYP Indonesia
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Terakhir dipindai: <strong className="text-foreground">{scannedAt}</strong>
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
              <Music2 className="h-7 w-7 text-pink-400 animate-pulse" /> Tren Sound & Efek Viral
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Pantau lonjakan musik dan template CapCut yang sedang naik pesat di FYP secara real-time. Pasang sound
              viral sebelum memuncak untuk mendongkrak algoritma video Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                if (activeTab === 'sounds') fetchSounds(true);
                else fetchEffects(true);
              }}
              disabled={isScanning}
              className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white font-medium hover:from-pink-500 hover:to-purple-500 shadow-lg shadow-pink-500/20"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Memindai Radar...' : '⚡ Pindai Tren Sekarang'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setAutoScanEnabled(!autoScanEnabled);
                toast(
                  autoScanEnabled
                    ? 'Auto-scan dimatikan'
                    : 'Auto-scan aktif: Radar diperbarui tiap 60 detik!',
                  { icon: autoScanEnabled ? '⏸️' : '⏱️' }
                );
              }}
              className={`text-xs ${
                autoScanEnabled
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'text-muted-foreground'
              }`}
            >
              <Radio className="mr-1.5 h-3.5 w-3.5" />
              {autoScanEnabled ? 'Auto-Scan: 60s' : 'Auto-Scan: Off'}
            </Button>
          </div>
        </div>

        {/* Dynamic Highlight Ticker */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-pink-300">
            <Flame className="h-4 w-4 text-orange-400 shrink-0" />
            <span>
              <strong>Laju Tercepat:</strong> {summaryInfo.fastestRising}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>Kategori Terpanas:</strong> {summaryInfo.topCategory}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-emerald-400">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>100% Algoritma FYP Match</span>
          </div>
        </div>
      </Card>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab('sounds')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'sounds'
              ? 'border-pink-500 text-pink-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Music2 className="h-4 w-4" />
          Audio & Musik Viral
          <span className="ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] bg-pink-500/20 text-pink-300 font-semibold">
            {sounds.length || 12}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('effects')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'effects'
              ? 'border-pink-500 text-pink-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wand2 className="h-4 w-4" />
          Efek & Template CapCut
          <span className="ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] bg-purple-500/20 text-purple-300 font-semibold">
            {effects.length || 8}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'guide'
              ? 'border-pink-500 text-pink-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Strategi Audio FYP
        </button>
      </div>

      {/* Floating Audio Playing Bar */}
      {currentPlayingId && (
        <div className="sticky top-4 z-30 flex items-center justify-between rounded-xl border border-pink-500/40 bg-[#161b22]/95 p-3.5 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400">
              <Disc3 className="h-6 w-6 animate-spin" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                Sedang Memutar Preview:
                <span className="text-pink-400">
                  {sounds.find((s) => s.id === currentPlayingId)?.title}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {sounds.find((s) => s.id === currentPlayingId)?.artist} • Preview Audio Browser
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Animated Waveform Visualizer */}
            <div className="hidden sm:flex items-center gap-1 h-6 px-2">
              {[40, 90, 60, 100, 75, 45, 95, 80, 50, 100, 65, 85].map((height, i) => (
                <span
                  key={i}
                  className="w-1 bg-gradient-to-t from-pink-500 to-purple-400 rounded-full animate-pulse"
                  style={{
                    height: `${height}%`,
                    animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                  }}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleStopAudio}
              className="h-8 border-pink-500/40 text-pink-300 hover:bg-pink-500/10 text-xs"
            >
              <Pause className="mr-1 h-3.5 w-3.5" /> Stop
            </Button>
          </div>
        </div>
      )}

      {/* TAB 1: SOUNDS & AUDIO */}
      {activeTab === 'sounds' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Semua Kategori' },
                { id: 'indo', label: '🇮🇩 Lokal FYP Indo' },
                { id: 'remix', label: '🎧 Jedag Jedug / Remix' },
                { id: 'rising', label: '🚀 Naik Pesat (>300%)' },
                { id: 'global', label: '🌍 Global FYP' },
                { id: 'bgm', label: '💼 BGM & Edukasi' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSoundCategory(cat.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    soundCategory === cat.id
                      ? 'bg-pink-600 text-white shadow-sm shadow-pink-500/30'
                      : 'bg-[#161b22] text-muted-foreground hover:bg-[#21262d] hover:text-foreground border border-border/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari lagu, artis, atau vibe..."
                value={soundSearch}
                onChange={(e) => setSoundSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-[#161b22] py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Sound Cards Grid */}
          {isLoadingSounds ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-xl border border-border/40 bg-[#161b22] p-5 animate-pulse"
                />
              ))}
            </div>
          ) : filteredSounds.length === 0 ? (
            <Card className="border border-border/40 bg-[#161b22] p-8 text-center">
              <Music2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">Tidak Ada Sound Ditemukan</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Coba ubah kata kunci pencarian atau pilih kategori lain.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSounds.map((sound) => {
                const isCurrentlyPlaying = currentPlayingId === sound.id && isPlaying;
                const isRankOne = sound.rank === 1;
                const isTopThree = sound.rank <= 3;

                return (
                  <Card
                    key={sound.id}
                    className={`relative overflow-hidden transition-all duration-200 border ${
                      isCurrentlyPlaying
                        ? 'border-pink-500 bg-pink-950/20 shadow-lg shadow-pink-500/10'
                        : isRankOne
                        ? 'border-amber-500/50 bg-[#161b22] hover:border-amber-500'
                        : 'border-border/60 bg-[#161b22] hover:border-pink-500/50'
                    } p-4`}
                  >
                    {/* Header Row: Rank & Velocity */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {/* Rank Badge */}
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg font-black text-sm ${
                            sound.rank === 1
                              ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-black shadow-md shadow-amber-500/20'
                              : sound.rank === 2
                              ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black'
                              : sound.rank === 3
                              ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-200'
                              : 'bg-muted/60 text-muted-foreground'
                          }`}
                        >
                          #{sound.rank}
                        </div>

                        {/* Rank Change Indicator */}
                        {sound.rankChange === 'new' ? (
                          <Badge variant="warning" className="text-[10px]">
                            ★ Baru Masuk
                          </Badge>
                        ) : typeof sound.rankChange === 'number' && sound.rankChange > 0 ? (
                          <Badge variant="success" className="text-[10px] flex items-center gap-0.5">
                            <TrendingUp className="h-3 w-3" /> +{sound.rankChange}
                          </Badge>
                        ) : typeof sound.rankChange === 'number' && sound.rankChange < 0 ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] text-muted-foreground border border-border/40">
                            {sound.rankChange}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] text-muted-foreground border border-border/40">
                            Stabil
                          </span>
                        )}

                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] border border-pink-500/30 bg-pink-500/10 text-pink-300 font-medium">
                          {sound.categoryLabel}
                        </span>
                      </div>

                      {/* Video Count & Virality */}
                      <div className="text-right">
                        <div className="text-xs font-semibold text-foreground flex items-center justify-end gap-1">
                          <Flame className="h-3.5 w-3.5 text-rose-400" />
                          {sound.videoCount} video
                        </div>
                        <div className="text-[10px] text-emerald-400 font-medium">
                          {sound.velocityScore}/100 Virality
                        </div>
                      </div>
                    </div>

                    {/* Sound Details */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground line-clamp-1 hover:text-pink-400 transition-colors">
                          {sound.title}
                        </h3>
                        <button
                          onClick={() => handleCopyTitle(sound.title, sound.id)}
                          className="text-muted-foreground hover:text-foreground text-xs ml-2 shrink-0 p-1 rounded hover:bg-muted/40"
                          title="Salin judul sound"
                        >
                          {copiedId === sound.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{sound.artist}</p>
                    </div>

                    {/* Velocity Banner */}
                    <div className="rounded-md bg-muted/40 p-2 mb-3 text-[11px] text-muted-foreground flex items-center justify-between gap-2">
                      <span className="text-pink-300 font-medium">{sound.velocityText}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Peak: {sound.peakHour}
                      </span>
                    </div>

                    {/* Vibe & Best Niche Tags */}
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[11px] text-muted-foreground">
                        <span className="text-foreground font-medium">Vibe:</span> {sound.vibe} •{' '}
                        {sound.bpm} BPM
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {sound.recommendedFor.map((rec, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-pink-500/10 px-1.5 py-0.5 text-[10px] text-pink-300 border border-pink-500/20"
                          >
                            ✓ {rec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                      {/* Play/Pause Button */}
                      <Button
                        size="sm"
                        onClick={() => handleTogglePlay(sound)}
                        className={`h-8 px-3 text-xs font-semibold ${
                          isCurrentlyPlaying
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-pink-600 hover:bg-pink-500 text-white shadow-sm shadow-pink-600/30'
                        }`}
                      >
                        {isCurrentlyPlaying ? (
                          <>
                            <Pause className="mr-1.5 h-3.5 w-3.5" /> Jeda
                          </>
                        ) : (
                          <>
                            <Play className="mr-1.5 h-3.5 w-3.5 fill-current" /> Preview
                          </>
                        )}
                      </Button>

                      {/* Use in Post Composer */}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUseInPost(sound)}
                        className="h-8 px-2.5 text-xs bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 border border-purple-500/30"
                      >
                        <Zap className="mr-1 h-3 w-3 text-amber-400" /> Gunakan di Post
                      </Button>

                      {/* Open in TikTok External */}
                      <a
                        href={sound.tiktokSearchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto inline-flex items-center text-[11px] text-muted-foreground hover:text-pink-400 p-1.5 rounded transition-colors"
                        title="Buka audio resmi di TikTok"
                      >
                        TikTok <ArrowUpRight className="ml-0.5 h-3 w-3" />
                      </a>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CAPCUT & TIKTOK EFFECTS */}
      {activeTab === 'effects' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Platform Filter */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'Semua Platform' },
                { id: 'capcut', label: '🎬 CapCut Template' },
                { id: 'tiktok', label: '🎵 TikTok Camera Filter' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setEffectPlatform(p.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    effectPlatform === p.id
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                      : 'bg-[#161b22] text-muted-foreground hover:bg-[#21262d] hover:text-foreground border border-border/40'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Semua Gaya' },
                { id: 'beat_sync', label: 'JJ / Beat Sync' },
                { id: 'aesthetic', label: 'Estetik Vintage' },
                { id: 'ai', label: 'AI Visual' },
                { id: 'transition', label: 'SlowMo & Transisi' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setEffectCategory(c.id)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                    effectCategory === c.id
                      ? 'bg-pink-600/30 text-pink-300 border border-pink-500/50'
                      : 'bg-muted/30 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Effects Grid */}
          {isLoadingEffects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-48 rounded-xl border border-border/40 bg-[#161b22] p-5 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {effects.map((effect) => (
                <Card
                  key={effect.id}
                  className="relative overflow-hidden border border-border/60 bg-[#161b22] hover:border-purple-500/50 transition-all p-4"
                >
                  {/* Decorative Gradient Header */}
                  <div
                    className={`h-2.5 w-full -mx-4 -mt-4 mb-3 bg-gradient-to-r ${effect.gradientClass}`}
                  />

                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                            effect.platform === 'capcut'
                              ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                              : 'bg-rose-600/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {effect.platform === 'capcut' ? '🎬 CapCut Template' : '🎵 Filter TikTok'}
                        </span>
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] text-muted-foreground border border-border/40">
                          {effect.categoryLabel}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{effect.title}</h3>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-emerald-400">
                        {effect.viralityScore}% Virality
                      </div>
                      <div className="text-[10px] text-muted-foreground">{effect.usageCount}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {effect.description}
                  </p>

                  {/* Creator & Recommended Audio Pairing */}
                  <div className="rounded-lg bg-muted/40 p-2.5 mb-3 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Kreator Template:</span>
                      <span className="font-semibold text-pink-300">{effect.author}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pasangan Audio Pas:</span>
                      <span className="font-semibold text-purple-300 line-clamp-1 max-w-[180px]">
                        🎵 {effect.recommendedSound}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    <a
                      href={effect.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-3 py-1.5 transition-colors shadow-sm shadow-purple-600/30"
                    >
                      {effect.platform === 'capcut' ? 'Gunakan di CapCut' : 'Coba di TikTok'}{' '}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleUseEffectInPost(effect)}
                      className="h-7 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                    >
                      <Sparkles className="mr-1 h-3 w-3" /> Buat Post
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STRATEGY & ALGORITHM GUIDE */}
      {activeTab === 'guide' && (
        <Card className="border border-border/60 bg-[#161b22] p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Cara Memanfaatkan Tren Sound & Efek untuk FYP (Panduan Algoritma 2026)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Banyak pembuat konten salah kaprah mengira memasang sound viral harus diputar keras-keras.
              Berikut teknik rahasia creator profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400 font-bold text-sm">
                1
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Trik Volume 5-10% (Ghost Audio)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Saat membuat video edukasi atau voiceover, tambahkan sound trending No. 1 atau No. 2, lalu
                kecilkan volumenya menjadi <strong>5% - 10%</strong> di CapCut atau TikTok. Algoritma tetap
                mendeteksi video Anda berada di folder sound trending tersebut, namun suara asli Anda tetap
                terdengar jernih.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 font-bold text-sm">
                2
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Tangkap Sound di Gelombang Pertama
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sound yang berlabel <strong className="text-emerald-400">Rising Stars / Naik Pesat</strong>{' '}
                dengan jumlah video antara 50K - 500K adalah momentum emas. Saat sound sudah mencapai di atas
                5 juta video, kompetisi menjadi terlalu ketat. Gunakan tab Rising Stars di SocialHub untuk
                mencuri start.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold text-sm">
                3
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Sinkronisasi Transisi (Beat Match)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Gunakan template CapCut yang terdaftar di tab Efek. Template CapCut sudah memiliki penanda
                ketukan otomatis sehingga pergantian foto/video tepat jatuh di ketukan bass, menghasilkan{' '}
                <em>watch time</em> dan <em>loop rate</em> yang jauh lebih tinggi.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-pink-500/30 bg-pink-950/20 p-4 text-xs text-pink-200 flex items-start gap-3">
            <Info className="h-5 w-5 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-pink-300">Tips Algoritma TikTok 2026:</strong> Sound yang disimpan
              (Add to Favorites) oleh penonton memiliki bobot nilai viral 3x lebih besar dibanding sekadar
              like. Menggunakan sound estetik yang disukai orang untuk disimpan akan mendongkrak skor virality
              video Anda ke audiens baru.
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
