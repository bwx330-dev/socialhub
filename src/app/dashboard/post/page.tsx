'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  X,
  Hash,
  Send,
  ImageIcon,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Save,
  Copy,
  Check,
  CalendarCheck,
  ExternalLink,
} from 'lucide-react';
import { Instagram, TikTok } from '@/components/ui/icons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

export default function CreatePostPage() {
  const [platforms, setPlatforms] = useState<string[]>(['instagram']);
  const [caption, setCaption] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mediaFile, setMediaFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Scheduling & State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<Array<{ platform: string; username: string; profile_pic?: string }>>([]);

  useEffect(() => {
    fetch('/api/accounts')
      .then((res) => res.json())
      .then((data) => {
        if (data.accounts) setConnectedAccounts(data.accounts);
      })
      .catch(() => {});
  }, []);

  const igAccount = connectedAccounts.find((a) => a.platform === 'instagram');
  const igUsername = igAccount?.username ? igAccount.username.replace('@', '') : 'socialhub.official';
  const igAvatar = igAccount?.profile_pic;

  const ttAccount = connectedAccounts.find((a) => a.platform === 'tiktok');
  const ttUsername = ttAccount?.username ? (ttAccount.username.startsWith('@') ? ttAccount.username : `@${ttAccount.username}`) : '@socialhub_id';
  const ttAvatar = ttAccount?.profile_pic;

  const maxCaptionLength = 2200;

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleAddHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = hashtagInput
        .trim()
        .replace(/,/g, '')
        .replace(/^#/, '');
      if (tag && !hashtags.includes(tag)) {
        setHashtags([...hashtags, tag]);
      }
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((h) => h !== tag));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setMediaFile(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(URL.createObjectURL(file));
    }
  };

  const fullCaption =
    caption + (hashtags.length > 0 ? '\n\n' + hashtags.map((h) => `#${h}`).join(' ') : '');

  // Simpan ke Kalender / Database Internal (100% Gratis)
  const handleSaveToPlanner = async (isScheduled: boolean) => {
    if (!caption.trim()) {
      toast.error('Caption tidak boleh kosong!');
      return;
    }
    if (platforms.length === 0) {
      toast.error('Pilih minimal satu platform!');
      return;
    }

    setIsSubmitting(true);
    try {
      for (const p of platforms) {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: p,
            caption: fullCaption,
            hashtags,
            media_url: mediaFile || 'https://picsum.photos/seed/post/640/640',
            media_type: 'image',
            scheduled_at: isScheduled
              ? (scheduleAt ? new Date(scheduleAt).toISOString() : new Date(Date.now() + 86400000).toISOString())
              : undefined,
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Gagal menyimpan rencana');
        }
      }

      toast.success(
        isScheduled
          ? 'Tersimpan di Kalender Konten! ðŸ“…'
          : 'Disimpan sebagai Draft Rencana! ðŸ“'
      );
      setCaption('');
      setHashtags([]);
      setMediaFile(null);
      setShowSchedulePicker(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Copy Caption
  const copyToClipboard = () => {
    if (!fullCaption) {
      toast.error('Tulis caption terlebih dahulu');
      return;
    }
    navigator.clipboard.writeText(fullCaption);
    setCopiedCaption(true);
    toast.success('Caption & Hashtag disalin! Siap dipaste.');
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  // 1-Click Copy & Buka Sosmed Langsung
  const openAndPost = (url: string, platformName: string) => {
    if (!fullCaption) {
      toast.error('Tulis caption terlebih dahulu');
      return;
    }
    navigator.clipboard.writeText(fullCaption);
    toast.success(`Caption disalin! Membuka ${platformName}...`);
    window.open(url, '_blank');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Form */}
      <div className="space-y-5">
        {/* Platform Selector */}
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-[#e6edf3]">Platform Target</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => togglePlatform('instagram')}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all
                ${
                  platforms.includes('instagram')
                    ? 'border-[#E1306C]/50 bg-gradient-to-r from-[#833AB4]/15 via-[#E1306C]/15 to-[#F77737]/15 text-[#E1306C]'
                    : 'border-[#30363d] text-[#8b949e] hover:border-[#E1306C]/30'
                }`}
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </button>
            <button
              onClick={() => togglePlatform('tiktok')}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all
                ${
                  platforms.includes('tiktok')
                    ? 'border-[#e6edf3]/50 bg-[#e6edf3]/10 text-[#e6edf3]'
                    : 'border-[#30363d] text-[#8b949e] hover:border-[#e6edf3]/30'
                }`}
            >
              <TikTok className="h-4 w-4" />
              TikTok
            </button>
          </div>

          {platforms.includes('tiktok') && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-[#30363d] bg-[#161b22] px-3.5 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3fb950]"></span>
                </span>
                <span className="text-[#8b949e]">Target Akun TikTok:</span>
                <strong className="text-[#e6edf3]">{ttUsername}</strong>
              </div>
              <span className="text-[11px] text-[#3fb950] font-medium">✓ Terhubung & Siap Upload</span>
            </div>
          )}
        </Card>

        {/* Media Upload */}
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-[#e6edf3]">Media (Foto / Video)</h3>
          {mediaFile ? (
            <div className="relative overflow-hidden rounded-xl border border-[#30363d]">
              <img
                src={mediaFile}
                alt="Preview"
                className="h-48 w-full object-cover"
              />
              <button
                onClick={() => setMediaFile(null)}
                className="absolute right-2 top-2 rounded-full bg-[#0d1117]/80 p-1.5 text-[#e6edf3] hover:bg-[#da3633]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all
                ${
                  isDragging
                    ? 'border-[#58a6ff] bg-[#58a6ff]/5'
                    : 'border-[#30363d] hover:border-[#58a6ff]/50'
                }`}
            >
              <Upload className="mb-2 h-8 w-8 text-[#8b949e]" />
              <p className="text-sm font-medium text-[#e6edf3]">
                Drag & drop atau klik untuk upload
              </p>
              <p className="mt-1 text-xs text-[#8b949e]">
                PNG, JPG, MP4 (max 50MB)
              </p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </Card>

        {/* Caption */}
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#e6edf3]">Caption Konten</h3>
            <span
              className={`text-xs ${
                caption.length > maxCaptionLength ? 'text-[#da3633]' : 'text-[#8b949e]'
              }`}
            >
              {caption.length}/{maxCaptionLength}
            </span>
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Tulis caption konten yang menarik di sini..."
            rows={4}
            className="w-full resize-none rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-3 text-sm text-[#e6edf3] placeholder-[#8b949e] outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/30"
          />
        </Card>

        {/* Hashtags */}
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-[#e6edf3]">Hashtags</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {hashtags.map((tag) => (
              <Badge key={tag} variant="info" className="gap-1.5">
                #{tag}
                <button
                  onClick={() => removeHashtag(tag)}
                  className="hover:text-[#da3633]"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="relative">
            <Hash className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
            <input
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={handleAddHashtag}
              placeholder="Ketik hashtag lalu tekan Enter..."
              className="w-full rounded-xl border border-[#30363d] bg-[#21262d] pl-9 pr-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#8b949e] outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/30"
            />
          </div>
        </Card>

        {/* Schedule Date & Time Picker */}
        {showSchedulePicker && (
          <Card className="border-[#58a6ff]/40 bg-[#161b22]/90">
            <h3 className="mb-2 text-sm font-semibold text-[#58a6ff]">ðŸ“… Tentukan Waktu Jadwal Konten</h3>
            <input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className="w-full rounded-xl border border-[#30363d] bg-[#21262d] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#58a6ff]"
            />
            <p className="mt-1.5 text-xs text-[#8b949e]">
              Konten akan dicatat di kalender pada waktu yang kamu tentukan.
            </p>
          </Card>
        )}

        {/* AKSI KONTEN */}
        <Card className="border-[#3fb950]/30 bg-[#161b22]">
          <h3 className="mb-2 text-sm font-semibold text-[#e6edf3] flex items-center gap-1.5">
            <Save className="h-4 w-4 text-[#3fb950]" />
            Kelola Konten (Gratis & Siap Pakai)
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button
              variant="secondary"
              onClick={() => handleSaveToPlanner(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              Simpan Draft
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (!showSchedulePicker) {
                  setShowSchedulePicker(true);
                  return;
                }
                handleSaveToPlanner(true);
              }}
              disabled={isSubmitting}
              className="text-xs"
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              {showSchedulePicker ? 'Konfirmasi Kalender' : 'Jadwalkan di Kalender'}
            </Button>
          </div>

          {/* Quick Copy & Launch Actions */}
          <div className="pt-3 border-t border-[#30363d] space-y-2">
            <button
              onClick={copyToClipboard}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#30363d] bg-[#21262d] py-2.5 text-xs font-semibold text-[#e6edf3] hover:border-[#58a6ff] hover:bg-[#30363d]"
            >
              {copiedCaption ? <Check className="h-4 w-4 text-[#3fb950]" /> : <Copy className="h-4 w-4 text-[#58a6ff]" />}
              {copiedCaption ? 'Tersalin ke Clipboard!' : 'Copy Caption & Hashtag'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => openAndPost('https://www.instagram.com', 'Instagram')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E1306C]/40 bg-gradient-to-r from-[#833AB4]/20 to-[#E1306C]/20 py-2 text-xs font-medium text-[#e6edf3] hover:border-[#E1306C]"
              >
                <Instagram className="h-3.5 w-3.5 text-[#E1306C]" />
                Copy & Buka IG
                <ExternalLink className="h-3 w-3 text-[#8b949e]" />
              </button>
              <button
                onClick={() => openAndPost('https://www.tiktok.com/upload', 'TikTok')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#30363d] bg-[#21262d] py-2 text-xs font-medium text-[#e6edf3] hover:border-[#e6edf3]"
              >
                <TikTok className="h-3.5 w-3.5" />
                Copy & Buka TikTok
                <ExternalLink className="h-3 w-3 text-[#8b949e]" />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Right: Live Preview */}
      <div className="space-y-5">
        {/* Instagram Preview */}
        {platforms.includes('instagram') && (
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-[#e6edf3]">
              <span className="inline-flex items-center gap-2">
                <Instagram className="h-4 w-4 text-[#E1306C]" />
                Instagram Preview
              </span>
            </h3>
            <div className="overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117]">
              {/* Header */}
              <div className="flex items-center gap-3 p-3">
                {igAvatar ? (
                  <img
                    src={igAvatar}
                    alt={igUsername}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-[#E1306C]"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] p-[2px]">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0d1117] text-xs font-bold text-[#e6edf3]">
                      {igUsername.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
                <span className="text-sm font-semibold text-[#e6edf3]">
                  {igUsername}
                </span>
              </div>

              {/* Image */}
              <div className="aspect-square w-full bg-[#161b22] flex items-center justify-center">
                {mediaFile ? (
                  <img
                    src={mediaFile}
                    alt="Post preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-[#8b949e]">
                    <ImageIcon className="h-12 w-12 mb-2" />
                    <span className="text-sm">Preview gambar</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <Heart className="h-6 w-6 text-[#e6edf3] cursor-pointer hover:text-[#da3633]" />
                    <MessageCircle className="h-6 w-6 text-[#e6edf3] cursor-pointer" />
                    <Share2 className="h-6 w-6 text-[#e6edf3] cursor-pointer" />
                  </div>
                  <Bookmark className="h-6 w-6 text-[#e6edf3] cursor-pointer" />
                </div>
                <p className="text-sm text-[#e6edf3] whitespace-pre-wrap">
                  <span className="font-semibold">{igUsername}</span>{' '}
                  {fullCaption || 'Caption akan muncul di sini...'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* TikTok Preview */}
        {platforms.includes('tiktok') && (
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-[#e6edf3]">
              <span className="inline-flex items-center gap-2">
                <TikTok className="h-4 w-4" />
                TikTok Preview
              </span>
            </h3>
            <div className="overflow-hidden rounded-xl border border-[#30363d] bg-black mx-auto max-w-[280px]">
              <div className="relative aspect-[9/16] w-full bg-[#0d1117] flex items-center justify-center">
                {mediaFile ? (
                  <img
                    src={mediaFile}
                    alt="TikTok preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-[#8b949e]">
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <span className="text-xs">Preview video</span>
                  </div>
                )}

                {/* Overlay content */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {ttAvatar ? (
                      <img
                        src={ttAvatar}
                        alt={ttUsername}
                        className="h-6 w-6 rounded-full object-cover ring-1 ring-white"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-[#e6edf3] flex items-center justify-center text-[10px] font-bold text-black">
                        {ttUsername.replace('@', '').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-white">
                      {ttUsername}
                    </span>
                  </div>
                  <p className="text-xs text-white/90 line-clamp-3">
                    {fullCaption || 'Caption akan muncul di sini...'}
                  </p>
                </div>

                {/* Right side actions */}
                <div className="absolute right-2 bottom-20 flex flex-col items-center gap-5">
                  <div className="flex flex-col items-center">
                    <Heart className="h-7 w-7 text-white" />
                    <span className="text-[10px] text-white">0</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageCircle className="h-7 w-7 text-white" />
                    <span className="text-[10px] text-white">0</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bookmark className="h-7 w-7 text-white" />
                    <span className="text-[10px] text-white">0</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
