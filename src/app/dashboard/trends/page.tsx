'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Flame,
  DollarSign,
  TrendingUp,
  Calendar,
  Sparkles,
  Clock,
  Send,
  Zap,
  CheckCircle2,
  Sliders,
  Award,
  BarChart2,
} from 'lucide-react';
import { TikTok, Instagram } from '@/components/ui/icons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

export default function TrendsAndRateCardPage() {
  const router = useRouter();

  // Connected accounts
  const [followerCount, setFollowerCount] = useState(1233);
  const [connectedUsername, setConnectedUsername] = useState('@bwxtigaadelapann');
  const [engagementRate, setEngagementRate] = useState(4.5);
  const [activeTab, setActiveTab] = useState<'ratecard' | 'matrix' | 'algorithm'>('ratecard');

  useEffect(() => {
    fetch('/api/accounts')
      .then((res) => res.json())
      .then((data) => {
        if (data.accounts && data.accounts.length > 0) {
          const tt = data.accounts.find((a: any) => a.platform === 'tiktok');
          if (tt) {
            setConnectedUsername(tt.username);
            if (tt.follower_count > 0) {
              setFollowerCount(tt.follower_count);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  // Rate card calculations in IDR
  const calculateRate = (followers: number, er: number) => {
    const base = Math.max(followers, 500);
    const erMultiplier = Math.max(0.8, er / 3.5);

    // Industry average IDR pricing
    const tiktokVideoMin = Math.round((base * 120 * erMultiplier) / 10000) * 10000;
    const tiktokVideoMax = Math.round((tiktokVideoMin * 1.8) / 10000) * 10000;

    const igReelsMin = Math.round((base * 90 * erMultiplier) / 10000) * 10000;
    const igReelsMax = Math.round((igReelsMin * 1.7) / 10000) * 10000;

    const igStoryMin = Math.round((base * 40 * erMultiplier) / 10000) * 10000;
    const igStoryMax = Math.round((igStoryMin * 1.6) / 10000) * 10000;

    const bundleMin = Math.round((tiktokVideoMin + igReelsMin + igStoryMin) * 0.85 / 10000) * 10000;
    const bundleMax = Math.round((tiktokVideoMax + igReelsMax + igStoryMax) * 0.85 / 10000) * 10000;

    return {
      tiktok: { min: Math.max(150000, tiktokVideoMin), max: Math.max(350000, tiktokVideoMax) },
      igReels: { min: Math.max(100000, igReelsMin), max: Math.max(250000, igReelsMax) },
      igStory: { min: Math.max(50000, igStoryMin), max: Math.max(120000, igStoryMax) },
      bundle: { min: Math.max(300000, bundleMin), max: Math.max(650000, bundleMax) },
    };
  };

  const rates = calculateRate(followerCount, engagementRate);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleUseIdea = (title: string, prompt: string) => {
    sessionStorage.setItem('socialhub_draft_caption', `${title}\n\n${prompt}\n\n#fyp #kontenindonesia #kreator`);
    toast.success('Ide konten dimuat ke pembuat postingan!');
    router.push('/dashboard/post');
  };

  const contentMatrix = [
    { day: 1, pillar: 'Curiosity Hook', title: 'Hal yang Gue Sesali Gak Tahu dari Awal', desc: 'Bahas 1 kesalahan paling umum di niche kamu yang bikin pemula rugi waktu.', format: 'TikTok Video (15s)' },
    { day: 2, pillar: 'Edukasi / Tutorial', title: 'Tutorial 3 Langkah Tanpa Modal', desc: 'Step by step solusi praktis yang langsung bisa dipraktekin hari ini juga.', format: 'Carousel / Video' },
    { day: 3, pillar: 'Mitos vs Fakta', title: 'Semua Orang Salah Paham Soal Ini...', desc: 'Bantah satu anggapan keliru dengan bukti nyata dan logika sederhana.', format: 'TikTok Video (30s)' },
    { day: 4, pillar: 'Behind The Scene', title: 'Di Balik Layar Bikin Konten Sehari-Hari', desc: 'Tunjukkan realita proses kerja kamu yang manusiawi dan relateable.', format: 'Story / Vlog' },
    { day: 5, pillar: 'Rekomendasi Tools', title: 'Website / Aplikasi Rahasia Andalan Gue', desc: 'Bocorin 1 tool gratis yang bikin hidup audiens 5x lebih gampang.', format: 'Screen Record' },
    { day: 6, pillar: 'Studi Kasus / Cerita', title: 'Dari Diremehkan Sampai Berhasil', desc: 'Cerita inspiratif tentang satu pencapaian kecil yang bermakna besar.', format: 'Storytelling' },
    { day: 7, pillar: 'Q&A & Interaksi', title: 'Jawab Pertanyaan Paling Sering Muncul', desc: 'Pilih 1 komentar dari followers dan buat video balasan mendalam.', format: 'Q&A Video' },
    { day: 8, pillar: 'Tips Cepat', title: 'Lakuin Ini dalam 5 Menit ke Depan', desc: 'Micro-action yang gak butuh mikir lama tapi langsung ada progresnya.', format: 'Shorts / Reels' },
    { day: 9, pillar: 'Unpopular Opinion', title: 'Gue Kurang Setuju Sama Tren yang Lagi Viral', desc: 'Berikan sudut pandang kritis tapi konstruktif terhadap tren saat ini.', format: 'Talking Head' },
    { day: 10, pillar: 'Listicle & Checklist', title: 'Checklist Wajib Sebelum Memulai', desc: '5 hal yang harus dipersiapkan sebelum terjun ke niche ini.', format: 'Carousel IG' },
    { day: 11, pillar: 'Before vs After', title: 'Transformasi Setelah Tahu Trik Ini', desc: 'Perbandingan kondisi dulu dan sekarang setelah menerapkan metode baru.', format: 'Split Screen' },
    { day: 12, pillar: 'Soft Selling / Rekomendasi', title: 'Barang / Solusi yang Paling Worth It', desc: 'Review jujur produk atau layanan yang benar-benar kamu pakai.', format: 'Review Video' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <Card className="border-[#f0883e]/30 bg-gradient-to-br from-[#161b22] via-[#161b22] to-[#f0883e]/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0883e]/20 text-[#f0883e]">
                <Flame className="h-4 w-4" />
              </div>
              <h1 className="text-lg font-bold text-[#e6edf3]">
                Inspirasi Konten & Rate Card Simulator
              </h1>
              <Badge variant="warning" className="text-[10px] bg-[#f0883e]/20 text-[#f0883e] border-[#f0883e]/30">
                Monetization Ready
              </Badge>
            </div>
            <p className="text-xs text-[#8b949e] max-w-2xl leading-relaxed">
              Hitung potensi penghasilan endorsement akun kamu berdasarkan data followers real-time, dapatkan kalender 30 hari ide konten terstruktur, dan pelajari formula algoritma FYP terbaru.
            </p>
          </div>
        </div>
      </Card>

      {/* Tab Switcher */}
      <div className="flex border-b border-[#30363d] gap-2">
        <button
          onClick={() => setActiveTab('ratecard')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'ratecard'
              ? 'border-[#f0883e] text-[#e6edf3]'
              : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
          }`}
        >
          <DollarSign className="h-4 w-4 text-[#3fb950]" />
          Kalkulator Rate Card Endorse
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'matrix'
              ? 'border-[#f0883e] text-[#e6edf3]'
              : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
          }`}
        >
          <Calendar className="h-4 w-4 text-[#58a6ff]" />
          Matriks Kalender Ide Konten
        </button>

        <button
          onClick={() => setActiveTab('algorithm')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'algorithm'
              ? 'border-[#f0883e] text-[#e6edf3]'
              : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
          }`}
        >
          <Zap className="h-4 w-4 text-[#e3b341]" />
          Pilar Algoritma FYP 2026
        </button>
      </div>

      {/* TAB 1: RATE CARD CALCULATOR */}
      {activeTab === 'ratecard' && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-[#30363d] bg-[#161b22] p-5 space-y-4">
              <h2 className="text-sm font-bold text-[#e6edf3] flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#58a6ff]" />
                Parameter Akun & Simulasi
              </h2>

              <div className="rounded-xl border border-[#3fb950]/30 bg-[#3fb950]/10 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8b949e]">Akun Terhubung:</span>
                  <span className="font-bold text-[#3fb950]">{connectedUsername}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-[#8b949e]">Followers Asli Saat Ini:</span>
                  <span className="font-bold text-[#e6edf3]">{followerCount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Slider Followers */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-[#8b949e]">
                    Jumlah Followers (Simulasi Proyeksi):
                  </label>
                  <span className="text-xs font-bold text-[#58a6ff]">
                    {followerCount.toLocaleString('id-ID')}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={followerCount}
                  onChange={(e) => setFollowerCount(parseInt(e.target.value, 10))}
                  className="w-full accent-[#58a6ff] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8b949e] mt-1">
                  <span>500</span>
                  <span>10K</span>
                  <span>50K</span>
                  <span>100K</span>
                </div>
              </div>

              {/* Slider Engagement Rate */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-[#8b949e]">
                    Engagement Rate (%):
                  </label>
                  <span className="text-xs font-bold text-[#3fb950]">
                    {engagementRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={engagementRate}
                  onChange={(e) => setEngagementRate(parseFloat(e.target.value))}
                  className="w-full accent-[#3fb950] cursor-pointer"
                />
                <p className="text-[11px] text-[#8b949e] mt-1">
                  Rata-rata industri: 2.5% – 5.0% (Tier Baik & Sehat)
                </p>
              </div>

              <div className="pt-2 border-t border-[#30363d] text-xs text-[#8b949e] leading-relaxed">
                💡 <em>Estimasi dihitung menggunakan standar tarif mikro-kreator Indonesia berdasarkan kombinasi jangkauan tayang (reach) dan rasio keterlibatan audiens.</em>
              </div>
            </Card>
          </div>

          {/* Pricing Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* TikTok Dedicated Video */}
              <Card className="border-[#30363d] bg-[#161b22] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white border border-[#30363d]">
                        <TikTok className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-[#e6edf3]">1x TikTok Dedicated</span>
                    </div>
                    <Badge variant="success" className="text-[10px]">Paling Diminati</Badge>
                  </div>
                  <p className="text-xs text-[#8b949e] mb-3">
                    Video ulasan produk penuh 30-60 detik dengan hook viral & CTA link di bio/keranjang.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#21262d]">
                  <p className="text-[11px] text-[#8b949e]">Estimasi Tarif Sponsor:</p>
                  <p className="text-base font-extrabold text-[#3fb950]">
                    {formatIDR(rates.tiktok.min)} – {formatIDR(rates.tiktok.max)}
                  </p>
                </div>
              </Card>

              {/* Instagram Reels */}
              <Card className="border-[#30363d] bg-[#161b22] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#833AB4] to-[#F77737] text-white">
                        <Instagram className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-[#e6edf3]">1x Instagram Reels</span>
                    </div>
                    <Badge variant="info" className="text-[10px]">High Visual</Badge>
                  </div>
                  <p className="text-xs text-[#8b949e] mb-3">
                    Reels estetik dengan transisi rapi, hashtag target, dan pin kolaborasi profil.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#21262d]">
                  <p className="text-[11px] text-[#8b949e]">Estimasi Tarif Sponsor:</p>
                  <p className="text-base font-extrabold text-[#58a6ff]">
                    {formatIDR(rates.igReels.min)} – {formatIDR(rates.igReels.max)}
                  </p>
                </div>
              </Card>

              {/* Instagram Story 3-Frame */}
              <Card className="border-[#30363d] bg-[#161b22] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E1306C]/20 text-[#E1306C]">
                        <Instagram className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-[#e6edf3]">Instagram Story (3 Frame)</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#8b949e] mb-3">
                    3 slide story interaktif dengan stiker link langsung, polling, atau Q&A box.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#21262d]">
                  <p className="text-[11px] text-[#8b949e]">Estimasi Tarif Sponsor:</p>
                  <p className="text-base font-extrabold text-[#bc8cff]">
                    {formatIDR(rates.igStory.min)} – {formatIDR(rates.igStory.max)}
                  </p>
                </div>
              </Card>

              {/* Paket Bundling All-In */}
              <Card className="border-[#e3b341]/40 bg-gradient-to-br from-[#161b22] to-[#e3b341]/10 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e3b341]/20 text-[#e3b341]">
                        <Award className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-[#e6edf3]">Paket Bundling Brand</span>
                    </div>
                    <Badge variant="warning" className="text-[10px]">Nilai Terbaik</Badge>
                  </div>
                  <p className="text-xs text-[#8b949e] mb-3">
                    1x TikTok Video + 1x IG Reels + 3x IG Story + Link Bio 7 Hari.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#21262d]">
                  <p className="text-[11px] text-[#8b949e]">Paket Rekomendasi Klien:</p>
                  <p className="text-base font-extrabold text-[#e3b341]">
                    {formatIDR(rates.bundle.min)} – {formatIDR(rates.bundle.max)}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 30-DAY CONTENT MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#8b949e]">
              Rencana konten 12 hari pertama dari matriks bulanan siap eksekusi agar konsistensi posting kamu tidak pernah terputus
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {contentMatrix.map((item) => (
              <Card key={item.day} className="border-[#30363d] bg-[#161b22] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-[#58a6ff]/15 px-2 py-0.5 text-[10px] font-bold text-[#58a6ff]">
                      HARI {item.day}
                    </span>
                    <span className="text-[10px] text-[#8b949e]">{item.format}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#f0883e] block mb-1">
                    {item.pillar}
                  </span>
                  <h3 className="text-xs font-bold text-[#e6edf3] mb-1.5 leading-snug">
                    "{item.title}"
                  </h3>
                  <p className="text-xs text-[#8b949e] leading-relaxed mb-4">
                    {item.desc}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleUseIdea(item.title, item.desc)}
                  className="w-full bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] text-xs h-7"
                >
                  <Send className="mr-1.5 h-3 w-3" />
                  Pakai Ide Ini di Buat Post
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FYP ALGORITHM PILLARS */}
      {activeTab === 'algorithm' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-[#30363d] bg-[#161b22] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#58a6ff]/20 text-[#58a6ff]">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[#e6edf3]">
                Aturan 3 Detik Pertama (Pacing & Hook)
              </h3>
            </div>
            <p className="text-xs text-[#8b949e] leading-relaxed mb-3">
              Algoritma TikTok & Reels mengukur <strong>Watch Time</strong> dalam 3 detik pertama sebelum memutuskan untuk mendistribusikan video kamu ke batch 10.000 penonton berikutnya.
            </p>
            <ul className="space-y-2 text-xs text-[#e6edf3]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#3fb950] mt-0.5 shrink-0" />
                <span>Gunakan gerakan visual atau teks judul kontras sebelum berbicara.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#3fb950] mt-0.5 shrink-0" />
                <span>Hindari pembukaan klise seperti <em>"Halo temen-temen apa kabar"</em>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#3fb950] mt-0.5 shrink-0" />
                <span>Langsung sebut masalah audiens: <em>"Stop lakuin ini kalau mau..."</em>.</span>
              </li>
            </ul>
          </Card>

          <Card className="border-[#30363d] bg-[#161b22] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3fb950]/20 text-[#3fb950]">
                <BarChart2 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[#e6edf3]">
                Hierarki Metrik Algoritma 2026
              </h3>
            </div>
            <p className="text-xs text-[#8b949e] leading-relaxed mb-3">
              Urutan bobot nilai yang paling disukai algoritma saat menentukan status FYP/Viral:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0d1117] border border-[#30363d]">
                <span className="font-semibold text-[#e6edf3]">1. Share / Bagikan (Nilai Tertinggi)</span>
                <span className="text-[#3fb950] font-bold">Bobot 10x</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0d1117] border border-[#30363d]">
                <span className="font-semibold text-[#e6edf3]">2. Save / Simpan Konten</span>
                <span className="text-[#3fb950] font-bold">Bobot 7x</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0d1117] border border-[#30363d]">
                <span className="font-semibold text-[#e6edf3]">3. Komentar Diskusi</span>
                <span className="text-[#58a6ff] font-bold">Bobot 4x</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0d1117] border border-[#30363d]">
                <span className="font-semibold text-[#e6edf3]">4. Likes / Suka</span>
                <span className="text-[#8b949e] font-bold">Bobot 1x</span>
              </div>
            </div>
          </Card>

          <Card className="border-[#30363d] bg-[#161b22] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e3b341]/20 text-[#e3b341]">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[#e6edf3]">
                Prime Time Jam Tayang Indonesia (WIB)
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
                <span className="text-[#8b949e] block text-[10px]">Pagi Hari</span>
                <span className="font-bold text-[#e6edf3]">06:30 – 08:00 WIB</span>
                <span className="text-[10px] text-[#8b949e] block mt-0.5">Waktu komuter & sarapan</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
                <span className="text-[#8b949e] block text-[10px]">Siang Hari</span>
                <span className="font-bold text-[#e6edf3]">11:45 – 13:00 WIB</span>
                <span className="text-[10px] text-[#8b949e] block mt-0.5">Istirahat makan siang</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
                <span className="text-[#8b949e] block text-[10px]">Sore Hari</span>
                <span className="font-bold text-[#e6edf3]">16:30 – 18:00 WIB</span>
                <span className="text-[10px] text-[#8b949e] block mt-0.5">Waktu santai pulang kerja</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#3fb950]/30 bg-[#3fb950]/10">
                <span className="text-[#3fb950] block text-[10px] font-bold">Malam (Golden Hour)</span>
                <span className="font-bold text-[#3fb950]">19:00 – 21:30 WIB</span>
                <span className="text-[10px] text-[#8b949e] block mt-0.5">Engagement tertinggi</span>
              </div>
            </div>
          </Card>

          <Card className="border-[#30363d] bg-[#161b22] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#bc8cff]/20 text-[#bc8cff]">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[#e6edf3]">
                Trik Audio Trending & Looping
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-[#e6edf3]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#3fb950] mt-0.5 shrink-0" />
                <span>Gunakan audio dengan ikon panah biru naik (naik daun) di TikTok.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#3fb950] mt-0.5 shrink-0" />
                <span>Setel volume audio trending ke 5-10% dan suara asli kamu ke 100%.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#3fb950] mt-0.5 shrink-0" />
                <span>Bikin kalimat akhir video menyambung mulus ke kalimat pertama (Seamless Loop).</span>
              </li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
