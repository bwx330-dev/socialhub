'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Copy,
  Check,
  Send,
  Flame,
  Zap,
  BookOpen,
  MessageSquare,
  RefreshCw,
  Lightbulb,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { TikTok, Instagram } from '@/components/ui/icons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface HookItem {
  id: string;
  category: string;
  hook: string;
  score: number;
  type: string;
}

const hookTemplates = [
  {
    category: 'Curiosity',
    type: 'Curiosity Gap',
    score: 98,
    templates: [
      'Alasan kenapa 90% kreator pemula gagal di [TOPIK] (padahal caranya simpel)...',
      'Jangan tonton video ini kalau kamu belum siap tahu fakta gelap tentang [TOPIK]!',
      'Gue nyesel baru tahu cara ini sekarang, ternyata [TOPIK] bisa semudah ini...',
      'Rahasia yang disembunyiin para pro tentang [TOPIK] dan gak pernah dibahas gratis.',
    ],
  },
  {
    category: 'FOMO',
    type: 'FOMO & Urgensi',
    score: 96,
    templates: [
      'Sebelum video ini ditakedown, save dulu tips penting seputar [TOPIK] ini!',
      'Kalau kamu masih ngelakuin hal ini di [TOPIK], siap-siap ketinggalan di 2026...',
      'Stop buang-buang waktu! Trik [TOPIK] ini bakal ubah hasil kamu dalam 7 hari.',
      'Hanya 1% orang yang tahu trik tersembunyi [TOPIK] ini. Kamu salah satunya?',
    ],
  },
  {
    category: 'Problem',
    type: 'Masalah & Solusi',
    score: 95,
    templates: [
      'Capek [TOPIK] gak ada hasil? Coba ubah 1 hal kecil ini sekarang juga!',
      'Masalah terbesar pemula saat mulai [TOPIK] dan gimana cara beresinnya dalam 3 langkah.',
      'Sering ngerasa stuck di [TOPIK]? Nih solusi praktis tanpa ribet yang udah gue buktiin.',
      'Tanda-tanda kamu salah arah di [TOPIK] dan langkah perbaikannya.',
    ],
  },
  {
    category: 'Controversy',
    type: 'Unpopular Opinion',
    score: 93,
    templates: [
      'Opini jujur yang bakal bikin banyak orang panas: Jangan pernah mulai [TOPIK] sebelum tahu ini.',
      'Benci bilang ini, tapi tutorial [TOPIK] yang sering viral itu kebanyakan menyesatkan.',
      'Kenapa cara lama [TOPIK] udah mati di tahun ini dan apa gantinya.',
      'Semua orang salah paham soal [TOPIK]. Ini kenyataan yang sebenernya.',
    ],
  },
  {
    category: 'Story',
    type: 'Storytelling',
    score: 94,
    templates: [
      'Plot twist terbesar dalam perjalanan gue belajar [TOPIK]...',
      'Dari nol dan diremehkan, gimana [TOPIK] akhirnya bisa mengubah segalanya.',
      'Gue hampir nyerah sama [TOPIK], sampai nemu satu metode ini secara gak sengaja.',
      'Cerita singkat gimana satu keputusan di [TOPIK] bikin hasil gue naik 10x lipat.',
    ],
  },
];

const presetCaptions: Record<string, { title: string; hook: string; body: string; cta: string; tags: string[] }> = {
  tiktok_tips: {
    title: 'Formula 3 Detik FYP TikTok',
    hook: 'Stop scroll! Ini alasan kenapa video kamu view-nya mentok di 200 dan cara nembus jutaan views...',
    body: `Kuncinya bukan di jam posting, tapi di 3 detik pertama (Hook Retention)!

1. Visual Hook: Gerakan tangan atau teks kontras dalam 1 detik pertama.
2. Pacing Cepat: Hilangkan jeda hening / nafas yang bikin orang bosen.
3. Looping Payout: Jawaban dari rasa penasaran ditaruh di detik terakhir.`,
    cta: 'Save video ini sekarang biar gak lupa pas mau bikin konten besok!',
    tags: ['#fyp', '#tipsfyp', '#contentcreator', '#tiktoktips', '#kelaskonten', '#strategikonten'],
  },
  promo_umkm: {
    title: 'Caption Soft Selling Produk Viral',
    hook: 'Niatnya cuma iseng nyobain, gak nyangka malah jadi barang yang wajib dipakai tiap hari...',
    body: `Sering banget dapet pertanyaan gimana caranya dapet hasil maksimal tanpa ribet.

Setelah coba berbagai alternatif, akhirnya nemu yang paling pas, awet, dan kualitasnya juara banget. Desainnya simpel tapi fungsional!

Detail keunggulan:
✨ Material premium & tahan lama
✨ Praktis dibawa kemana aja
✨ Garansi resmi & garansi kepuasan`,
    cta: 'Klik link di bio sebelum kehabisan slot diskon khusus minggu ini!',
    tags: ['#racuntiktok', '#racunbelanja', '#produkviral', '#rekomendasi', '#promohemat', '#shopeehaul'],
  },
  edukasi_karir: {
    title: 'Konten Edukasi Otoritas & Karir',
    hook: '3 Skill krusial di 2026 yang bikin kamu dicari perusahaan besar, bukan kamu yang nyari kerja...',
    body: `Dunia digital berubah cepat banget. Orang yang cuma ngandelin skill monoton bakal gampang tergantikan.

Ini 3 kemampuan yang nilainya paling tinggi sekarang:
1. Data-Driven Problem Solving (Kemampuan ambil keputusan dari data)
2. AI Workflow Orchestration (Bukan cuma prompt, tapi otomatisasi alur kerja)
3. High-Value Communication (Bisa jelaskan hal rumit jadi sederhana)

Fokus asah salah satu dari 3 ini dalam 3 bulan ke depan.`,
    cta: 'Kira-kira nomor berapa yang paling pengen kamu kuasai? Tulis di komentar!',
    tags: ['#karir', '#tipsberkarir', '#produktivitas', '#selfimprovement', '#belajaronline', '#pengembangandiri'],
  },
};

export default function AIStudioPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'hook' | 'caption' | 'swipe'>('hook');

  // Hook generator state
  const [topic, setTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [generatedHooks, setGeneratedHooks] = useState<HookItem[]>([]);
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Caption generator state
  const [captionTopic, setCaptionTopic] = useState('');
  const [platform, setPlatform] = useState<'tiktok' | 'instagram'>('tiktok');
  const [tone, setTone] = useState('Santai & Gaul');
  const [formatType, setFormatType] = useState('Edukasi & Tips');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState<{
    hook: string;
    body: string;
    cta: string;
    tags: string[];
  } | null>(null);

  const handleGenerateHooks = () => {
    if (!topic.trim()) {
      toast.error('Masukkan topik atau niche konten kamu');
      return;
    }

    setIsGeneratingHooks(true);
    setTimeout(() => {
      const cleanTopic = topic.trim();
      const results: HookItem[] = [];

      hookTemplates.forEach((cat) => {
        if (selectedCategory === 'ALL' || selectedCategory === cat.category) {
          cat.templates.forEach((tmpl, idx) => {
            results.push({
              id: `${cat.category}-${idx}`,
              category: cat.category,
              type: cat.type,
              score: cat.score - (idx % 3),
              hook: tmpl.replace(/\[TOPIK\]/g, cleanTopic),
            });
          });
        }
      });

      setGeneratedHooks(results);
      setIsGeneratingHooks(false);
      toast.success(`${results.length} variasi hook viral berhasil dibuat!`);
    }, 400);
  };

  const handleGenerateCaption = () => {
    if (!captionTopic.trim()) {
      toast.error('Masukkan topik atau inti pembahasan konten');
      return;
    }

    setIsGeneratingCaption(true);
    setTimeout(() => {
      const clean = captionTopic.trim();
      let preset = presetCaptions.tiktok_tips;

      if (formatType.includes('Promo') || formatType.includes('Jual')) {
        preset = presetCaptions.promo_umkm;
      } else if (formatType.includes('Karir') || formatType.includes('Inspirasi')) {
        preset = presetCaptions.edukasi_karir;
      }

      setGeneratedCaption({
        hook: `Stop scroll! Ini rahasia ${clean} yang jarang banget dibocorin para kreator besar...`,
        body: `Banyak yang ngira kalau ${clean} itu butuh modal gede atau waktu lama. Padahal kuncinya ada di 3 langkah ini:

1. Fondasi Dasar: Pahami siapa audiens kamu sebelum bikin konten seputar ${clean}.
2. Formula Konsistensi: Lebih baik 1 konten bermutu tiap hari daripada 5 tapi asal-asalan.
3. Analisis Hasil: Cek metrik engagement tiap minggu dan duplikasi konten yang ramai.`,
        cta: platform === 'tiktok'
          ? 'Save video ini sekarang dan share ke temen kamu yang lagi belajar hal ini!'
          : 'Double tap ❤️ kalau postingan ini bermanfaat & save untuk dibaca lagi nanti!',
        tags: [
          `#${clean.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          '#fyp',
          '#viralindonesia',
          platform === 'tiktok' ? '#tiktoktips' : '#reelsinstagram',
          '#kelaskonten',
          '#strategikonten',
          '#kreatorindonesia',
        ],
      });
      setIsGeneratingCaption(false);
      toast.success('Script & Caption berhasil di-generate!');
    }, 500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendToPost = (captionText: string, tags: string[] = []) => {
    sessionStorage.setItem('socialhub_draft_caption', captionText);
    sessionStorage.setItem('socialhub_draft_tags', JSON.stringify(tags));
    toast.success('Mengalihkan ke pembuat postingan...');
    router.push('/dashboard/post');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-[#bc8cff]/30 bg-gradient-to-br from-[#161b22] via-[#161b22] to-[#bc8cff]/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#bc8cff]/20 text-[#bc8cff]">
                <Sparkles className="h-4 w-4" />
              </div>
              <h1 className="text-lg font-bold text-[#e6edf3]">
                AI Hook & Caption Studio
              </h1>
              <Badge variant="info" className="text-[10px] bg-[#bc8cff]/20 text-[#bc8cff] border-[#bc8cff]/30">
                FYP Algorithm Ready
              </Badge>
            </div>
            <p className="text-xs text-[#8b949e] max-w-2xl leading-relaxed">
              Tingkatkan retensi 3 detik pertama dengan Generator Hook Viral, Script TikTok terstruktur, dan Caption Instagram ber-engagement tinggi secara otomatis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setTopic('Tips Bisnis Online');
                handleGenerateHooks();
              }}
              className="text-xs border-[#30363d]"
            >
              <Lightbulb className="mr-1.5 h-3.5 w-3.5 text-[#e3b341]" />
              Contoh Instan
            </Button>
          </div>
        </div>
      </Card>

      {/* Tab Switcher */}
      <div className="flex border-b border-[#30363d] gap-2">
        <button
          onClick={() => setActiveTab('hook')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'hook'
              ? 'border-[#bc8cff] text-[#e6edf3]'
              : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
          }`}
        >
          <Flame className="h-4 w-4 text-[#f0883e]" />
          Viral Hook Generator (3 Detik FYP)
        </button>

        <button
          onClick={() => setActiveTab('caption')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'caption'
              ? 'border-[#bc8cff] text-[#e6edf3]'
              : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
          }`}
        >
          <MessageSquare className="h-4 w-4 text-[#58a6ff]" />
          Full Script & Caption Studio
        </button>

        <button
          onClick={() => setActiveTab('swipe')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'swipe'
              ? 'border-[#bc8cff] text-[#e6edf3]'
              : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
          }`}
        >
          <BookOpen className="h-4 w-4 text-[#3fb950]" />
          Swipe File & Template Viral
        </button>
      </div>

      {/* TAB 1: HOOK GENERATOR */}
      {activeTab === 'hook' && (
        <div className="space-y-6">
          <Card className="border-[#30363d] bg-[#161b22] p-5">
            <h2 className="text-sm font-bold text-[#e6edf3] mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#e3b341]" />
              Masukkan Topik Konten Kamu
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Contoh: Belajar Coding, Kuliner Pedas, Affiliate TikTok, Bisnis Thrift..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateHooks()}
                  className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:border-[#bc8cff] focus:outline-none"
                />
              </div>
              <Button
                onClick={handleGenerateHooks}
                disabled={isGeneratingHooks}
                className="bg-[#bc8cff] text-black hover:bg-[#d2a8ff] font-semibold text-xs px-5"
              >
                {isGeneratingHooks ? (
                  <>
                    <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                    Menghasilkan...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    Generate Hook
                  </>
                )}
              </Button>
            </div>

            {/* Category filter */}
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-[#8b949e] mr-1">Filter Kategori:</span>
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'Curiosity', label: 'Curiosity Gap' },
                { id: 'FOMO', label: 'FOMO & Urgensi' },
                { id: 'Problem', label: 'Masalah & Solusi' },
                { id: 'Controversy', label: 'Unpopular Opinion' },
                { id: 'Story', label: 'Storytelling' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-[#bc8cff]/20 text-[#bc8cff] border border-[#bc8cff]/40'
                      : 'bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Hooks List */}
          {generatedHooks.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#8b949e]">
                  Menampilkan <strong className="text-[#e6edf3]">{generatedHooks.length}</strong> formula hook viral untuk topik <strong className="text-[#bc8cff]">"{topic}"</strong>
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {generatedHooks.map((item) => (
                  <Card
                    key={item.id}
                    className="group relative border-[#30363d] bg-[#161b22] p-4 transition-all hover:border-[#bc8cff]/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-full bg-[#21262d] px-2 py-0.5 text-[10px] font-medium text-[#8b949e]">
                        {item.type}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#f0883e]">
                        <Flame className="h-3 w-3" />
                        {item.score}% Potensi Viral
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-[#e6edf3] leading-relaxed mb-4">
                      "{item.hook}"
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#21262d]">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCopy(item.hook, item.id)}
                        className="text-xs h-7 px-2.5"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="mr-1 h-3 w-3 text-[#3fb950]" />
                            Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" />
                            Salin
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSendToPost(item.hook)}
                        className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs h-7 px-2.5"
                      >
                        <Send className="mr-1 h-3 w-3" />
                        Pakai di Post
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="border-dashed border-[#30363d] bg-[#161b22]/50 p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#bc8cff]/10 text-[#bc8cff]">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-[#e6edf3]">
                Belum Ada Hook yang Dihasilkan
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-[#8b949e]">
                Ketik topik konten kamu di atas, lalu klik <strong>Generate Hook</strong> untuk memproduksi belasan variasi kalimat pembuka yang bikin penonton stop scrolling.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: FULL CAPTION & SCRIPT STUDIO */}
      {activeTab === 'caption' && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Form Setup */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-[#30363d] bg-[#161b22] p-5 space-y-4">
              <h2 className="text-sm font-bold text-[#e6edf3] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#bc8cff]" />
                Parameter Konten
              </h2>

              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                  Target Platform
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlatform('tiktok')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                      platform === 'tiktok'
                        ? 'border-[#58a6ff] bg-[#58a6ff]/10 text-white'
                        : 'border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#58a6ff]'
                    }`}
                  >
                    <TikTok className="h-4 w-4" />
                    TikTok Video Script
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('instagram')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                      platform === 'instagram'
                        ? 'border-[#E1306C] bg-[#E1306C]/10 text-white'
                        : 'border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#58a6ff]'
                    }`}
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram Caption
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1">
                  Inti Topik / Produk / Cerita <span className="text-[#da3633]">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Cara mengatur keuangan gaji 3 juta agar bisa nabung dan tetap nikmatin hidup..."
                  value={captionTopic}
                  onChange={(e) => setCaptionTopic(e.target.value)}
                  className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] p-3 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:border-[#bc8cff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                  Tone of Voice (Gaya Bahasa)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    'Santai & Gaul',
                    'Profesional & Edukatif',
                    'Lucu & Sarkas',
                    'Storytelling Emosional',
                    'Soft Selling / Review',
                    'Hard Selling / Promo',
                  ].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`rounded-lg border p-2 text-left transition-all ${
                        tone === t
                          ? 'border-[#bc8cff] bg-[#bc8cff]/10 text-[#e6edf3] font-semibold'
                          : 'border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#30363d]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                  Format Konten
                </label>
                <select
                  value={formatType}
                  onChange={(e) => setFormatType(e.target.value)}
                  className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-3 py-2 text-xs text-[#e6edf3] focus:border-[#bc8cff] focus:outline-none"
                >
                  <option value="Edukasi & Tips">3-Point Edukasi & Tips</option>
                  <option value="Story & Plot Twist">Storytelling & Plot Twist</option>
                  <option value="Review & Rekomendasi">Review Produk / Racun Belanja</option>
                  <option value="Before & After">Transformasi Before-After</option>
                  <option value="Promo Diskon">Promosi Diskon Terbatas</option>
                </select>
              </div>

              <Button
                onClick={handleGenerateCaption}
                disabled={isGeneratingCaption}
                className="w-full bg-[#bc8cff] text-black hover:bg-[#d2a8ff] font-semibold text-xs py-2.5"
              >
                {isGeneratingCaption ? (
                  <>
                    <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                    Sedang Menyusun Script...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    Buat Script & Caption Sekarang
                  </>
                )}
              </Button>
            </Card>
          </div>

          {/* Generated Result Preview */}
          <div className="lg:col-span-7 space-y-4">
            {generatedCaption ? (
              <Card className="border-[#bc8cff]/40 bg-[#161b22] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#bc8cff]/20 px-2.5 py-0.5 text-xs font-semibold text-[#bc8cff]">
                      ✨ Hasil AI Terstruktur
                    </span>
                    <span className="text-xs text-[#8b949e]">Tone: {tone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        handleCopy(
                          `${generatedCaption.hook}\n\n${generatedCaption.body}\n\n${generatedCaption.cta}\n\n${generatedCaption.tags.join(' ')}`,
                          'full-caption'
                        )
                      }
                      className="text-xs"
                    >
                      {copiedId === 'full-caption' ? (
                        <>
                          <Check className="mr-1.5 h-3.5 w-3.5 text-[#3fb950]" />
                          Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                          Salin Semua
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleSendToPost(
                          `${generatedCaption.hook}\n\n${generatedCaption.body}\n\n${generatedCaption.cta}`,
                          generatedCaption.tags
                        )
                      }
                      className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs"
                    >
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                      Kirim ke Buat Post
                    </Button>
                  </div>
                </div>

                {/* Hook section */}
                <div className="rounded-xl border border-[#f0883e]/30 bg-[#f0883e]/10 p-3.5">
                  <span className="text-[11px] font-bold text-[#f0883e] block mb-1">
                    🎯 0-3 DETIK (HOOK RETENSI TINGGI):
                  </span>
                  <p className="text-xs font-semibold text-[#e6edf3]">
                    "{generatedCaption.hook}"
                  </p>
                </div>

                {/* Body section */}
                <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-3.5">
                  <span className="text-[11px] font-bold text-[#58a6ff] block mb-1">
                    📝 BODY CONTENT / SCRIPT UTAMA:
                  </span>
                  <p className="text-xs text-[#e6edf3] whitespace-pre-line leading-relaxed">
                    {generatedCaption.body}
                  </p>
                </div>

                {/* CTA section */}
                <div className="rounded-xl border border-[#3fb950]/30 bg-[#3fb950]/10 p-3.5">
                  <span className="text-[11px] font-bold text-[#3fb950] block mb-1">
                    📢 CALL TO ACTION (CTA):
                  </span>
                  <p className="text-xs text-[#e6edf3] font-medium">
                    {generatedCaption.cta}
                  </p>
                </div>

                {/* Tags section */}
                <div>
                  <span className="text-[11px] font-bold text-[#8b949e] block mb-1.5">
                    🏷️ HASHTAG RELEVAN:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedCaption.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-0.5 text-xs text-[#58a6ff]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-dashed border-[#30363d] bg-[#161b22]/50 p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#bc8cff]/10 text-[#bc8cff]">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-[#e6edf3]">
                  Preview Script & Caption AI
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-xs text-[#8b949e]">
                  Isi topik konten di formulir sebelah kiri dan klik tombol generate untuk melihat draf konten lengkap siap posting.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SWIPE FILE / EVERGREEN TEMPLATES */}
      {activeTab === 'swipe' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#8b949e]">
              Kumpulan struktur konten yang sudah terbukti menghasilkan ratusan ribu views di TikTok & Instagram
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Struktur "Mitos vs Fakta"',
                format: 'Edukasi Populer',
                desc: 'Membongkar miskonsepsi umum di niche kamu untuk membangun otoritas ahli secara instan.',
                formula: '1. Sebut mitos populer\n2. Jelaskan kenapa itu salah\n3. Berikan fakta sebenarnya + bukti\n4. Tanya pendapat audiens',
              },
              {
                title: 'Struktur "Sebelum vs Sesudah"',
                format: 'Transformasi & Hasil',
                desc: 'Sangat cocok untuk produk fisik, hasil belajar, desain, atau progres finansial/kebugaran.',
                formula: '1. Tunjukkan kondisi awal yang buruk\n2. Titik balik / apa yang diubah\n3. Hasil nyata sekarang\n4. Ajakan belajar bareng',
              },
              {
                title: 'Struktur "3 Kesalahan Fatal"',
                format: 'Problem & Avoidance',
                desc: 'Orang lebih takut kehilangan daripada ingin mendapatkan. Struktur ini memicu retensi kuat.',
                formula: '1. Hook: "Hindari 3 kesalahan ini"\n2. Poin 1 (Kesalahan umum)\n3. Poin 2 (Kesalahan teknis)\n4. Poin 3 (Yang paling fatal)',
              },
              {
                title: 'Struktur "Behind The Scene"',
                format: 'Humanizing Brand',
                desc: 'Memperlihatkan proses jujur di balik layar pembuatan konten atau packaging pesanan UMKM.',
                formula: '1. Cuplikan kekacauan / kesibukan\n2. Cerita tantangan hari ini\n3. Proses penyelesaian\n4. Rasa syukur ke audiens',
              },
              {
                title: 'Struktur "Review Jujur Tanpa Endorse"',
                format: 'Tinggi Kepercayaan',
                desc: 'Menghilangkan keraguan audiens dengan memberikan ulasan objektif plus minus.',
                formula: '1. Hook: "Beli pakai uang sendiri"\n2. Ekspektasi vs Realita\n3. Nilai minus yang jarang dibahas\n4. Kesimpulan: Worth it atau gak',
              },
              {
                title: 'Struktur "Day in My Life (Kreator)"',
                format: 'Vlog Estetik',
                desc: 'Format santai yang membangun koneksi personal erat dengan followers setia.',
                formula: '1. Aktivitas pagi hari yang estetik\n2. Highlight proyek yang dikerjakan\n3. Satu pelajaran hidup hari ini\n4. Pesan penutup hangat',
              },
            ].map((tmpl, i) => (
              <Card key={i} className="border-[#30363d] bg-[#161b22] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-md bg-[#21262d] px-2 py-0.5 text-[10px] font-semibold text-[#bc8cff]">
                      {tmpl.format}
                    </span>
                    <span className="text-[11px] text-[#8b949e]">Template #{i + 1}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#e6edf3] mb-1">{tmpl.title}</h3>
                  <p className="text-xs text-[#8b949e] mb-3 leading-relaxed">{tmpl.desc}</p>
                  <div className="rounded-lg bg-[#0d1117] p-2.5 text-[11px] text-[#e6edf3] font-mono whitespace-pre-line border border-[#30363d]/60 mb-4">
                    {tmpl.formula}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setCaptionTopic(tmpl.title);
                    setActiveTab('caption');
                  }}
                  className="w-full text-xs"
                >
                  Gunakan Template Ini
                  <ArrowRight className="ml-1.5 h-3 w-3" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
