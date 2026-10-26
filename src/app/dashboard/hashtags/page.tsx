'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Hash,
  Copy,
  Check,
  Send,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Search,
  Bookmark,
  Plus,
  Trash2,
  Sparkles,
  Info,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface NicheItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  tags: string[];
}

const nicheCategories: NicheItem[] = [
  {
    id: 'bisnis',
    name: 'Bisnis & UMKM',
    icon: '💼',
    description: 'Untuk jualan online, tips bisnis, wirausaha, dan edukasi finansial',
    tags: ['#bisnisonline', '#umkmindonesia', '#tipsbisnis', '#belajarbisnis', '#pebisnismuda', '#wirausahamuda', '#jualanonline', '#caricuan', '#idebisnis', '#bisnisviral', '#bisnisrumahan', '#strategibisnis'],
  },
  {
    id: 'kuliner',
    name: 'Kuliner & Makanan',
    icon: '🍜',
    description: 'Untuk review makanan, resep masakan, dan jajanan viral',
    tags: ['#kulinerindonesia', '#kulinerjakarta', '#makananviral', '#jajananviral', '#resepmasakan', '#resepsimpel', '#resepviral', '#kulineran', '#makanenak', '#streetfoodindonesia', '#mukbangindonesia', '#kulinerhits'],
  },
  {
    id: 'fashion',
    name: 'Fashion & OOTD',
    icon: '👗',
    description: 'Untuk outfit of the day, review pakaian, thrifting, dan styling tips',
    tags: ['#ootdindo', '#fashionindonesia', '#outfitideas', '#stylinghacks', '#racunshopee', '#racuntiktok', '#ootdkece', '#fashionhacks', '#thriftindo', '#racunfashion', '#styleinspo', '#mixandmatch'],
  },
  {
    id: 'tech',
    name: 'Gadget & Teknologi',
    icon: '📱',
    description: 'Untuk review smartphone, tips AI, software, dan teknologi terkini',
    tags: ['#gadgetindonesia', '#reviewgadget', '#tekonologi', '#aitools', '#tipsgadget', '#hpsultan', '#tipsiphone', '#tipsandroid', '#aplikasigratis', '#smartphonereview', '#techhacks', '#gadgetviral'],
  },
  {
    id: 'edukasi',
    name: 'Edukasi & Karir',
    icon: '📚',
    description: 'Untuk self-improvement, tips kerja, bahasa Inggris, dan produktivitas',
    tags: ['#tipsberkarir', '#selfimprovement', '#belajaronline', '#pengembangandiri', '#produktivitas', '#kursusgratis', '#tipskuliah', '#kerjaremote', '#belajarbahasainggris', '#kelaskonten', '#motivasihidup', '#mindsetpositif'],
  },
  {
    id: 'gaming',
    name: 'Gaming & Esports',
    icon: '🎮',
    description: 'Untuk gameplay Mobile Legends, Free Fire, Valorant, dan meme gaming',
    tags: ['#gamingindonesia', '#mlbbid', '#mobilelegendsindonesia', '#freefireindo', '#valorantindonesia', '#gamerindonesia', '#gameplayviral', '#momenlucugaming', '#streamerindo', '#esportsindonesia', '#tipsgaming', '#proplayer'],
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Healing',
    icon: '✈️',
    description: 'Untuk daily vlog, rekomendasi tempat nongkrong, dan liburan',
    tags: ['#aestheticvibes', '#dailyvlogindo', '#healingtime', '#tempatnongkrong', '#coffeeshopjakarta', '#travelindonesia', '#liburanhemat', '#hiddengemjakarta', '#exploreindonesia', '#weekendvibes', '#vlogindonesia', '#spotfoto'],
  },
];

const bannedKeywords = [
  'followforfollow',
  'f4f',
  'likeforlike',
  'l4l',
  'sub4sub',
  'instalikes',
  'gainfollowers',
  'hackfollowers',
  'beli_followers',
  'jualfollowers',
  'giveawayindo_palsu',
  'judionline',
  'slotgacor',
  'porn',
  'dewasa',
];

export default function HashtagsPage() {
  const router = useRouter();

  // Generator state
  const [keyword, setKeyword] = useState('');
  const [generatedTags, setGeneratedTags] = useState<{
    mega: string[];
    medium: string[];
    niche: string[];
  } | null>(null);

  // Checker state
  const [checkText, setCheckText] = useState('');
  const [scanResult, setScanResult] = useState<{
    scanned: boolean;
    bannedFound: string[];
    safeCount: number;
    riskLevel: 'safe' | 'warning' | 'danger';
  }>({
    scanned: false,
    bannedFound: [],
    safeCount: 0,
    riskLevel: 'safe',
  });

  // Custom Saved Sets
  const [savedSets, setSavedSets] = useState<Array<{ id: string; name: string; tags: string[] }>>([
    {
      id: 'default-fyp',
      name: 'Set Boost FYP Umum',
      tags: ['#fyp', '#viralindonesia', '#trending', '#foryoupage', '#beritaviral', '#foryourpage', '#xyzbca'],
    },
  ]);
  const [newSetName, setNewSetName] = useState('');
  const [newSetTags, setNewSetTags] = useState('');
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('socialhub_saved_hashtags');
    if (saved) {
      try {
        setSavedSets(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const saveToStorage = (sets: Array<{ id: string; name: string; tags: string[] }>) => {
    setSavedSets(sets);
    localStorage.setItem('socialhub_saved_hashtags', JSON.stringify(sets));
  };

  const handleGenerateTags = () => {
    if (!keyword.trim()) {
      toast.error('Masukkan topik atau kata kunci');
      return;
    }

    const clean = keyword.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    setGeneratedTags({
      mega: [
        '#fyp',
        '#foryoupage',
        '#viral',
        '#trending',
        '#viralindonesia',
        '#xyzbca',
      ],
      medium: [
        `#${clean}indonesia`,
        `#tips${clean}`,
        `#${clean}viral`,
        `#belajar${clean}`,
        `#${clean}pemula`,
        `#info${clean}`,
        `#${clean}hacks`,
        `#rekomendasi${clean}`,
      ],
      niche: [
        `#komunitas${clean}`,
        `#${clean}jakarta`,
        `#cerita${clean}`,
        `#kreator${clean}`,
        `#${clean}terbaik`,
        `#update${clean}`,
        `#${clean}2026`,
        `#strategi${clean}`,
      ],
    });

    toast.success('Kombinasi 3-Tier Hashtag berhasil dibuat!');
  };

  const handleScanShadowban = () => {
    if (!checkText.trim()) {
      toast.error('Ketik atau tempel hashtag/caption yang ingin diperiksa');
      return;
    }

    const lower = checkText.toLowerCase();
    const found: string[] = [];

    bannedKeywords.forEach((b) => {
      if (lower.includes(b)) {
        found.push(b);
      }
    });

    const tags = checkText.match(/#[a-zA-Z0-9_]+/g) || [];

    setScanResult({
      scanned: true,
      bannedFound: found,
      safeCount: Math.max(0, tags.length - found.length),
      riskLevel: found.length > 1 ? 'danger' : found.length === 1 ? 'warning' : 'safe',
    });

    if (found.length === 0) {
      toast.success('Hashtag Anda 100% Bersih & Aman dari Shadowban!', { icon: '🛡️' });
    } else {
      toast.error(`Terdeteksi ${found.length} kata berisiko pembatasan algoritma!`);
    }
  };

  const handleCopyTags = (tagList: string[], key: string) => {
    navigator.clipboard.writeText(tagList.join(' '));
    setCopiedKey(key);
    toast.success(`${tagList.length} hashtag disalin ke clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendToPost = (tagList: string[]) => {
    sessionStorage.setItem('socialhub_draft_tags', JSON.stringify(tagList));
    toast.success('Hashtag ditambahkan ke pembuat postingan!');
    router.push('/dashboard/post');
  };

  const handleCreateNewSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetName.trim() || !newSetTags.trim()) {
      toast.error('Nama set dan hashtag wajib diisi');
      return;
    }

    const tags = newSetTags
      .split(/[\s,]+/)
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .filter((t) => t.length > 1);

    const updated = [
      ...savedSets,
      {
        id: `set-${Date.now()}`,
        name: newSetName.trim(),
        tags,
      },
    ];

    saveToStorage(updated);
    setNewSetName('');
    setNewSetTags('');
    setIsAddingSet(false);
    toast.success('Set hashtag favorit berhasil disimpan!');
  };

  const handleDeleteSet = (id: string) => {
    const updated = savedSets.filter((s) => s.id !== id);
    saveToStorage(updated);
    toast.success('Set hashtag dihapus');
  };

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <Card className="border-[#3fb950]/30 bg-gradient-to-br from-[#161b22] via-[#161b22] to-[#3fb950]/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3fb950]/20 text-[#3fb950]">
                <Hash className="h-4 w-4" />
              </div>
              <h1 className="text-lg font-bold text-[#e6edf3]">
                Hashtag & Tren Explorer
              </h1>
              <Badge variant="success" className="text-[10px]">
                Algorithm Safe
              </Badge>
            </div>
            <p className="text-xs text-[#8b949e] max-w-2xl leading-relaxed">
              Temukan kombinasi hashtag 3-Tier untuk mendongkrak distribusi algoritma TikTok & Instagram Reels, serta periksa keamanan tag dari risiko shadowban.
            </p>
          </div>
        </div>
      </Card>

      {/* SECTION 1: 3-TIER HASHTAG GENERATOR */}
      <Card className="border-[#30363d] bg-[#161b22] p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-[#e3b341]" />
          <h2 className="text-sm font-bold text-[#e6edf3]">
            Smart 3-Tier FYP Hashtag Generator
          </h2>
        </div>
        <p className="text-xs text-[#8b949e] mb-4">
          Kombinasi seimbang antara <strong>High Volume</strong> (jangkauan luas), <strong>Medium Competition</strong> (ranking peluang), dan <strong>Target Niche</strong> (audiens spesifik).
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#8b949e]" />
            <input
              type="text"
              placeholder="Ketik topik konten (contoh: kuliner pedas, skincare pemula, saham)..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateTags()}
              className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] pl-9 pr-4 py-2.5 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:border-[#3fb950] focus:outline-none"
            />
          </div>
          <Button
            onClick={handleGenerateTags}
            className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold px-5"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Generate Tag
          </Button>
        </div>

        {/* Results */}
        {generatedTags && (
          <div className="space-y-4 pt-3 border-t border-[#30363d]">
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Tier 1: Mega */}
              <div className="rounded-xl border border-[#e3b341]/30 bg-[#e3b341]/10 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#e3b341]">
                    🔥 TIER 1: HIGH VOLUME
                  </span>
                  <span className="text-[10px] text-[#8b949e]">&gt; 1M posts</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {generatedTags.mega.map((tag) => (
                    <span key={tag} className="rounded bg-[#0d1117] px-2 py-0.5 text-xs text-[#e6edf3] border border-[#30363d]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tier 2: Medium */}
              <div className="rounded-xl border border-[#58a6ff]/30 bg-[#58a6ff]/10 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#58a6ff]">
                    ⚡ TIER 2: MEDIUM TARGET
                  </span>
                  <span className="text-[10px] text-[#8b949e]">100K - 500K</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {generatedTags.medium.map((tag) => (
                    <span key={tag} className="rounded bg-[#0d1117] px-2 py-0.5 text-xs text-[#e6edf3] border border-[#30363d]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tier 3: Niche */}
              <div className="rounded-xl border border-[#3fb950]/30 bg-[#3fb950]/10 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#3fb950]">
                    🎯 TIER 3: SPECIFIC NICHE
                  </span>
                  <span className="text-[10px] text-[#8b949e]">&lt; 50K posts</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {generatedTags.niche.map((tag) => (
                    <span key={tag} className="rounded bg-[#0d1117] px-2 py-0.5 text-xs text-[#e6edf3] border border-[#30363d]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions for All Tags */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[#8b949e]">
                Total: <strong>{generatedTags.mega.length + generatedTags.medium.length + generatedTags.niche.length} Hashtags</strong> seimbang
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    handleCopyTags(
                      [...generatedTags.mega, ...generatedTags.medium, ...generatedTags.niche],
                      'all-tags'
                    )
                  }
                  className="text-xs"
                >
                  {copiedKey === 'all-tags' ? (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5 text-[#3fb950]" />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3.5 w-3.5" />
                      Salin Semua (3-Tier)
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    handleSendToPost([
                      ...generatedTags.mega,
                      ...generatedTags.medium,
                      ...generatedTags.niche,
                    ])
                  }
                  className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs"
                >
                  <Send className="mr-1 h-3.5 w-3.5" />
                  Kirim ke Buat Post
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 2: SHADOWBAN CHECKER & POPULAR NICHES */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Shadowban Scanner */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-[#30363d] bg-[#161b22] p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-[#3fb950]" />
              <h2 className="text-sm font-bold text-[#e6edf3]">
                Shadowban & Algoritma Risk Scanner
              </h2>
            </div>
            <p className="text-xs text-[#8b949e] mb-3">
              Periksa apakah ada hashtag terlarang (spam / banned) yang bisa membuat jangkauan konten kamu dibatasi sistem.
            </p>

            <textarea
              rows={4}
              placeholder="Tempel hashtag atau caption lengkap kamu di sini..."
              value={checkText}
              onChange={(e) => setCheckText(e.target.value)}
              className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] p-3 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:border-[#3fb950] focus:outline-none mb-3"
            />

            <Button
              onClick={handleScanShadowban}
              size="sm"
              className="w-full bg-[#21262d] border border-[#30363d] hover:border-[#3fb950] text-[#e6edf3] text-xs font-semibold py-2"
            >
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-[#3fb950]" />
              Pindai Keamanan Tag Sekarang
            </Button>

            {/* Scan Result */}
            {scanResult.scanned && (
              <div
                className={`mt-4 rounded-xl border p-3.5 text-xs ${
                  scanResult.riskLevel === 'safe'
                    ? 'border-[#3fb950]/40 bg-[#3fb950]/10 text-[#3fb950]'
                    : 'border-[#da3633]/40 bg-[#da3633]/10 text-[#f85149]'
                }`}
              >
                {scanResult.riskLevel === 'safe' ? (
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#e6edf3]">Status: Aman & Bersih</p>
                      <p className="text-[11px] text-[#8b949e] mt-0.5">
                        Tidak ditemukan kata kunci terlarang. Aman digunakan untuk boosting algoritma.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#f85149]">
                        Terdeteksi Kata Kunci Berisiko!
                      </p>
                      <p className="text-[11px] text-[#e6edf3] mt-0.5">
                        Kata terdeteksi: <strong>{scanResult.bannedFound.join(', ')}</strong>
                      </p>
                      <p className="text-[11px] text-[#8b949e] mt-1">
                        Hapus kata di atas untuk mencegah penalti shadowban.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Saved Sets */}
          <Card className="border-[#30363d] bg-[#161b22] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-[#58a6ff]" />
                <h3 className="text-sm font-bold text-[#e6edf3]">
                  Kumpulan Hashtag Tersimpan
                </h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAddingSet(!isAddingSet)}
                className="text-xs h-7 text-[#58a6ff]"
              >
                <Plus className="mr-1 h-3 w-3" />
                Tambah Set
              </Button>
            </div>

            {isAddingSet && (
              <form onSubmit={handleCreateNewSet} className="mb-4 rounded-xl border border-[#30363d] bg-[#0d1117] p-3 space-y-2">
                <input
                  type="text"
                  placeholder="Nama Set (contoh: Set Weekend / Set Jualan)"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  className="w-full rounded-lg border border-[#30363d] bg-[#161b22] px-2.5 py-1.5 text-xs text-[#e6edf3] focus:outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Daftar tag (pisahkan dengan spasi: #fyp #bisnis #kuliner)"
                  value={newSetTags}
                  onChange={(e) => setNewSetTags(e.target.value)}
                  className="w-full rounded-lg border border-[#30363d] bg-[#161b22] px-2.5 py-1.5 text-xs text-[#e6edf3] focus:outline-none"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsAddingSet(false)}
                    className="text-xs h-6 px-2"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs h-6 px-3"
                  >
                    Simpan
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-2.5">
              {savedSets.map((set) => (
                <div
                  key={set.id}
                  className="rounded-xl border border-[#30363d] bg-[#0d1117] p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-[#e6edf3]">{set.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyTags(set.tags, set.id)}
                        className="rounded p-1 text-[#8b949e] hover:text-[#58a6ff]"
                        title="Salin Set"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSet(set.id)}
                        className="rounded p-1 text-[#8b949e] hover:text-[#da3633]"
                        title="Hapus Set"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#8b949e] line-clamp-2 mb-2 font-mono">
                    {set.tags.join(' ')}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleSendToPost(set.tags)}
                    className="w-full bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] text-[11px] h-6"
                  >
                    Pakai di Buat Post
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Niche Library Explorer */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-[#30363d] bg-[#161b22] p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#e6edf3] flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#f0883e]" />
                  Tren Hashtag Populer Indonesia
                </h3>
                <p className="text-xs text-[#8b949e]">
                  Kategori terkurasi dengan volume pencarian tertinggi di TikTok & Instagram
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {nicheCategories.map((niche) => (
                <div
                  key={niche.id}
                  className="rounded-xl border border-[#30363d] bg-[#0d1117] p-3.5 transition-colors hover:border-[#58a6ff]/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{niche.icon}</span>
                      <div>
                        <h4 className="text-xs font-bold text-[#e6edf3]">{niche.name}</h4>
                        <span className="text-[11px] text-[#8b949e]">{niche.description}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCopyTags(niche.tags, niche.id)}
                        className="text-xs h-7 px-2.5"
                      >
                        {copiedKey === niche.id ? (
                          <>
                            <Check className="mr-1 h-3 w-3 text-[#3fb950]" />
                            Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" />
                            Salin ({niche.tags.length})
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSendToPost(niche.tags)}
                        className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs h-7 px-2.5"
                      >
                        <Send className="mr-1 h-3 w-3" />
                        Gunakan
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {niche.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-[#161b22] px-2 py-0.5 text-[11px] font-medium text-[#58a6ff] border border-[#30363d]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
