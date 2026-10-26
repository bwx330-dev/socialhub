'use client';

import { useState, useEffect } from 'react';
import {
  Link2,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  Share2,
  Eye,
  ShoppingBag,
  MessageCircle,
  Globe,
} from 'lucide-react';
import { TikTok, Instagram } from '@/components/ui/icons';

const YoutubeIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface BioLinkItem {
  id: string;
  title: string;
  url: string;
  icon: 'whatsapp' | 'store' | 'youtube' | 'tiktok' | 'instagram' | 'custom';
  isActive: boolean;
}

const themeStyles: Record<string, { bg: string; card: string; text: string; buttonBg: string; buttonBorder: string }> = {
  obsidian: {
    bg: 'bg-[#0d1117]',
    card: 'bg-[#161b22] border-[#30363d]',
    text: 'text-[#e6edf3]',
    buttonBg: 'bg-[#21262d] hover:bg-[#30363d]',
    buttonBorder: 'border-[#30363d]',
  },
  neon: {
    bg: 'bg-[#05050a]',
    card: 'bg-[#0f111a] border-[#00f2fe]/30',
    text: 'text-white',
    buttonBg: 'bg-gradient-to-r from-[#00f2fe]/20 to-[#fe0979]/20 hover:opacity-90',
    buttonBorder: 'border-[#00f2fe]/40',
  },
  sunset: {
    bg: 'bg-[#120815]',
    card: 'bg-[#200e26] border-[#E1306C]/30',
    text: 'text-white',
    buttonBg: 'bg-gradient-to-r from-[#833AB4]/30 via-[#E1306C]/30 to-[#F77737]/30 hover:opacity-90',
    buttonBorder: 'border-[#E1306C]/40',
  },
  emerald: {
    bg: 'bg-[#06120b]',
    card: 'bg-[#0a2315] border-[#3fb950]/30',
    text: 'text-white',
    buttonBg: 'bg-[#194c2d] hover:bg-[#23683e]',
    buttonBorder: 'border-[#3fb950]/40',
  },
};

export default function BioLinkPage() {
  const [username, setUsername] = useState('bwxtigaadelapann');
  const [displayName, setDisplayName] = useState('bwx dev');
  const [bio, setBio] = useState('Content Creator & Tech Enthusiast | Follow my journey across TikTok & Instagram');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<'obsidian' | 'neon' | 'sunset' | 'emerald'>('obsidian');

  const [links, setLinks] = useState<BioLinkItem[]>([
    {
      id: '1',
      title: 'Chat WhatsApp Bisnis / Endorsement',
      url: 'https://wa.me/6281234567890',
      icon: 'whatsapp',
      isActive: true,
    },
    {
      id: '2',
      title: 'Toko Online & Rekomendasi Produk',
      url: 'https://shopee.co.id',
      icon: 'store',
      isActive: true,
    },
    {
      id: '3',
      title: 'Follow Akun Instagram @bw283_',
      url: 'https://instagram.com/bw283_',
      icon: 'instagram',
      isActive: true,
    },
    {
      id: '4',
      title: 'Tonton Video TikTok Terbaru',
      url: 'https://tiktok.com/@bwxtigaadelapann',
      icon: 'tiktok',
      isActive: true,
    },
  ]);

  const [copiedLink, setCopiedLink] = useState(false);

  // Load connected account data
  useEffect(() => {
    fetch('/api/accounts')
      .then((res) => res.json())
      .then((data) => {
        if (data.accounts && data.accounts.length > 0) {
          const tt = data.accounts.find((a: any) => a.platform === 'tiktok');
          if (tt) {
            const clean = tt.username.replace('@', '');
            setUsername(clean);
            setDisplayName(clean);
            if (tt.profile_pic) setAvatarUrl(tt.profile_pic);
          }
        }
      })
      .catch(() => {});

    // Load saved bio settings
    const saved = localStorage.getItem('socialhub_biolink_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.displayName) setDisplayName(parsed.displayName);
        if (parsed.bio) setBio(parsed.bio);
        if (parsed.theme) setSelectedTheme(parsed.theme);
        if (parsed.links) setLinks(parsed.links);
      } catch {}
    }
  }, []);

  const handleSaveBio = () => {
    const data = {
      username,
      displayName,
      bio,
      theme: selectedTheme,
      links,
      avatarUrl,
    };
    localStorage.setItem('socialhub_biolink_data', JSON.stringify(data));
    toast.success('Halaman Smart Bio Link berhasil disimpan!');
  };

  const handleAddLink = () => {
    const newLink: BioLinkItem = {
      id: `link-${Date.now()}`,
      title: 'Tautan Baru',
      url: 'https://',
      icon: 'custom',
      isActive: true,
    };
    setLinks([...links, newLink]);
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const handleUpdateLink = (id: string, field: keyof BioLinkItem, value: any) => {
    setLinks(
      links.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const getLinkIcon = (iconType: string) => {
    switch (iconType) {
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4 text-[#3fb950]" />;
      case 'store':
        return <ShoppingBag className="h-4 w-4 text-[#e3b341]" />;
      case 'youtube':
        return <YoutubeIcon className="h-4 w-4 text-[#da3633]" />;
      case 'tiktok':
        return <TikTok className="h-4 w-4 text-white" />;
      case 'instagram':
        return <Instagram className="h-4 w-4 text-[#E1306C]" />;
      default:
        return <Globe className="h-4 w-4 text-[#58a6ff]" />;
    }
  };

  const publicUrl = `https://socialhub-wine.vercel.app/b/${username}`;

  const handleCopyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    toast.success('Link Bio berhasil disalin! Tempel di bio profil TikTok / IG kamu.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currentTheme = themeStyles[selectedTheme];

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <Card className="border-[#58a6ff]/30 bg-gradient-to-br from-[#161b22] via-[#161b22] to-[#58a6ff]/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#58a6ff]/20 text-[#58a6ff]">
                <Link2 className="h-4 w-4" />
              </div>
              <h1 className="text-lg font-bold text-[#e6edf3]">
                Smart Link-in-Bio Builder
              </h1>
              <Badge variant="info" className="text-[10px]">
                Linktree Alternative
              </Badge>
            </div>
            <p className="text-xs text-[#8b949e] max-w-2xl leading-relaxed">
              Buat halaman link profil personal estetik untuk ditaruh di bio TikTok & Instagram. Tautkan WhatsApp, Toko Online, YouTube, dan konten viral kamu dalam 1 link rapi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleCopyPublicUrl}
              className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold"
            >
              {copiedLink ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Link Tersalin
                </>
              ) : (
                <>
                  <Share2 className="mr-1.5 h-3.5 w-3.5" />
                  Salin Link Bio
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Grid: Editor (Left) & Mobile Mockup (Right) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Editor Form */}
        <div className="lg:col-span-7 space-y-5">
          {/* Profile Identity */}
          <Card className="border-[#30363d] bg-[#161b22] p-5 space-y-4">
            <h2 className="text-sm font-bold text-[#e6edf3] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#58a6ff]" />
              Informasi Profil
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1">
                  Nama Tampilan
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-3 py-2 text-xs text-[#e6edf3] focus:border-[#58a6ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1">
                  Username Handle (@)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                  className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-3 py-2 text-xs text-[#e6edf3] focus:border-[#58a6ff] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">
                Bio / Tagline Singkat
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] p-3 text-xs text-[#e6edf3] focus:border-[#58a6ff] focus:outline-none"
              />
            </div>

            {/* Theme Selector */}
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                Tema Desain Halaman
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'obsidian', name: 'Obsidian Dark', color: 'from-[#161b22] to-[#21262d]' },
                  { id: 'neon', name: 'Cyber Neon', color: 'from-[#00f2fe] to-[#fe0979]' },
                  { id: 'sunset', name: 'Sunset Glow', color: 'from-[#833AB4] to-[#F77737]' },
                  { id: 'emerald', name: 'Emerald Forest', color: 'from-[#238636] to-[#2ea043]' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id as any)}
                    className={`rounded-xl border p-2.5 text-center transition-all ${
                      selectedTheme === t.id
                        ? 'border-[#58a6ff] bg-[#58a6ff]/10 text-white font-semibold'
                        : 'border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#58a6ff]'
                    }`}
                  >
                    <div className={`h-4 w-full rounded bg-gradient-to-r ${t.color} mb-1.5`} />
                    <span className="text-[11px] block truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Links Management */}
          <Card className="border-[#30363d] bg-[#161b22] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#e6edf3] flex items-center gap-2">
                <Link2 className="h-4 w-4 text-[#3fb950]" />
                Daftar Tombol Tautan ({links.length})
              </h2>
              <Button
                size="sm"
                onClick={handleAddLink}
                className="bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#e6edf3] text-xs h-7"
              >
                <Plus className="mr-1 h-3 w-3" />
                Tambah Link
              </Button>
            </div>

            <div className="space-y-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="rounded-xl border border-[#30363d] bg-[#0d1117] p-3.5 space-y-2.5 transition-colors hover:border-[#58a6ff]/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={link.icon}
                        onChange={(e) => handleUpdateLink(link.id, 'icon', e.target.value)}
                        className="rounded-lg border border-[#30363d] bg-[#161b22] px-2 py-1 text-xs text-[#e6edf3] focus:outline-none"
                      >
                        <option value="whatsapp">💬 WhatsApp</option>
                        <option value="store">🛍️ Toko Online</option>
                        <option value="instagram">📸 Instagram</option>
                        <option value="tiktok">🎵 TikTok</option>
                        <option value="youtube">▶️ YouTube</option>
                        <option value="custom">🌐 Website Umum</option>
                      </select>
                      <label className="flex items-center gap-1.5 text-xs text-[#8b949e] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={link.isActive}
                          onChange={(e) => handleUpdateLink(link.id, 'isActive', e.target.checked)}
                          className="rounded border-[#30363d] text-[#3fb950] focus:ring-0"
                        />
                        Aktif
                      </label>
                    </div>

                    <button
                      onClick={() => handleRemoveLink(link.id)}
                      className="p-1 rounded text-[#8b949e] hover:text-[#da3633] transition-colors"
                      title="Hapus Link"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Judul Tombol"
                      value={link.title}
                      onChange={(e) => handleUpdateLink(link.id, 'title', e.target.value)}
                      className="rounded-lg border border-[#30363d] bg-[#161b22] px-2.5 py-1.5 text-xs text-[#e6edf3] focus:border-[#58a6ff] focus:outline-none"
                    />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                      className="rounded-lg border border-[#30363d] bg-[#161b22] px-2.5 py-1.5 text-xs text-[#e6edf3] focus:border-[#58a6ff] focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSaveBio}
              className="w-full bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold py-2.5 mt-2"
            >
              Simpan Perubahan Bio Link
            </Button>
          </Card>
        </div>

        {/* Live Smartphone Mockup Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3 text-xs text-[#8b949e]">
            <Smartphone className="h-4 w-4" />
            <span>Live Interactive Mobile Preview</span>
          </div>

          {/* Smartphone Frame */}
          <div className="w-[320px] rounded-[40px] border-[8px] border-[#21262d] bg-black p-3 shadow-2xl relative overflow-hidden">
            {/* Camera notch */}
            <div className="mx-auto h-4 w-24 rounded-full bg-[#21262d] mb-4" />

            {/* Screen Content */}
            <div className={`min-h-[520px] rounded-[24px] ${currentTheme.bg} p-4 flex flex-col items-center text-center justify-between`}>
              <div className="w-full space-y-4 pt-2">
                {/* Avatar */}
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#30363d] to-[#161b22] p-1 border-2 border-[#58a6ff]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-white uppercase">
                      {displayName.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Name & Handle */}
                <div>
                  <h3 className={`text-sm font-bold ${currentTheme.text}`}>
                    {displayName}
                  </h3>
                  <p className="text-[11px] text-[#8b949e] font-mono">
                    @{username}
                  </p>
                </div>

                {/* Bio */}
                <p className="text-xs text-[#8b949e] leading-relaxed max-w-[240px] mx-auto">
                  {bio}
                </p>

                {/* Links */}
                <div className="space-y-2 pt-2">
                  {links.filter((l) => l.isActive).map((l) => (
                    <a
                      key={l.id}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between rounded-xl border ${currentTheme.buttonBorder} ${currentTheme.buttonBg} p-3 text-xs font-semibold text-white transition-all transform hover:scale-[1.02] shadow-sm`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {getLinkIcon(l.icon)}
                        <span className="truncate text-left">{l.title}</span>
                      </div>
                      <ExternalLink className="h-3 w-3 shrink-0 text-[#8b949e]" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Footer inside screen */}
              <div className="pt-6 pb-2 text-[10px] text-[#8b949e] flex items-center gap-1">
                <span>Powered by</span>
                <strong className="text-[#58a6ff]">SocialHub</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
