'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  FileText,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Instagram, TikTok } from '@/components/ui/icons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatThousands } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Account {
  id: string;
  platform: 'instagram' | 'tiktok';
  username: string;
  follower_count: number;
  following_count: number;
  post_count: number;
  profile_pic?: string;
  is_active: boolean;
  access_token?: string;
  is_api_connected?: boolean;
  created_at: string;
  updated_at?: string;
}

export const isApiConnected = (acc?: Account | null): boolean => {
  if (!acc) return false;
  if (typeof acc.is_api_connected === 'boolean') return acc.is_api_connected;
  return Boolean(
    acc.access_token &&
    acc.access_token !== 'manual_token' &&
    acc.access_token !== 'manual' &&
    acc.access_token.length > 20
  );
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [platform, setPlatform] = useState<'instagram' | 'tiktok'>('instagram');
  const [username, setUsername] = useState('');
  const [followerCount, setFollowerCount] = useState('');
  const [followingCount, setFollowingCount] = useState('');
  const [postCount, setPostCount] = useState('');
  const [profilePic, setProfilePic] = useState('');

  // Fetch connected accounts (auto-syncs TikTok in background)
  const loadAccounts = async (showLoadingState = false) => {
    try {
      if (showLoadingState) setLoading(true);
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (data.accounts) {
        setAccounts(data.accounts);
      }
    } catch {
      // silent background catch
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts(true);

    // Auto-sync whenever user focuses window or returns to this tab
    const handleFocus = () => loadAccounts(false);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadAccounts(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // Auto-sync interval every 15 seconds while tab is active
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadAccounts(false);
      }
    }, 15000);

    // Check query params for OAuth status
    const urlParams = new URLSearchParams(window.location.search);
    const successParam = urlParams.get('success');
    const errorParam = urlParams.get('error');
    const uName = urlParams.get('username');

    if (successParam === 'tiktok_oauth' || successParam === 'tiktok') {
      toast.success(
        `Berhasil terhubung ke TikTok Developer API (@${uName || 'akun'})! Metrik auto-sync real-time aktif.`,
        { duration: 6000 }
      );
      window.history.replaceState({}, '', window.location.pathname);
      loadAccounts(false);
    } else if (errorParam) {
      toast.error(`Koneksi API gagal: ${decodeURIComponent(errorParam)}`, {
        duration: 7000,
      });
      window.history.replaceState({}, '', window.location.pathname);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, []);

  const handleOpenAddModal = (defaultPlatform?: 'instagram' | 'tiktok') => {
    if (defaultPlatform) setPlatform(defaultPlatform);
    setUsername('');
    setFollowerCount('');
    setFollowingCount('');
    setPostCount('');
    setProfilePic('');
    setIsModalOpen(true);
  };

  const handleEditAccount = (acc: Account) => {
    setPlatform(acc.platform);
    setUsername(acc.username.replace('@', ''));
    setFollowerCount(acc.follower_count.toString());
    setFollowingCount(acc.following_count.toString());
    setPostCount(acc.post_count.toString());
    setProfilePic(acc.profile_pic || '');
    setIsModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Username wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          username: username.trim(),
          follower_count: parseInt(followerCount, 10) || 0,
          following_count: parseInt(followingCount, 10) || 0,
          post_count: parseInt(postCount, 10) || 0,
          profile_pic: profilePic.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Gagal menyimpan akun');
        return;
      }

      toast.success(data.message || 'Akun berhasil disimpan!');
      setIsModalOpen(false);
      loadAccounts(true);
    } catch {
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin memutuskan akun ${name}?`)) return;

    try {
      const res = await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Akun ${name} berhasil diputuskan`);
        loadAccounts(true);
      } else {
        toast.error(data.error || 'Gagal menghapus akun');
      }
    } catch {
      toast.error('Gagal menghubungi server');
    }
  };

  const handleOAuthConnect = async (targetPlatform: string) => {
    if (targetPlatform === 'instagram') {
      try {
        const res = await fetch('/api/instagram/connect');
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error(data.error || 'INSTAGRAM_APP_ID belum diatur di .env.local', {
            duration: 5000,
          });
        }
      } catch {
        toast.error('Gagal menghubungi server');
      }
      return;
    }

    if (targetPlatform === 'tiktok') {
      try {
        const res = await fetch('/api/tiktok/connect');
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error(data.error || 'TIKTOK_CLIENT_KEY belum diatur di .env.local', {
            duration: 5000,
          });
        }
      } catch {
        toast.error('Gagal menghubungi server');
      }
      return;
    }
  };

  const igAccount = accounts.find((a) => a.platform === 'instagram');
  const ttAccount = accounts.find((a) => a.platform === 'tiktok');
  const isTtApi = isApiConnected(ttAccount);
  const isIgApi = isApiConnected(igAccount);

  return (
    <div className="space-y-6">
      {/* Banner SocialHub */}
      <Card className="border-[#3fb950]/30 bg-gradient-to-br from-[#161b22] to-[#3fb950]/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="h-5 w-5 text-[#3fb950]" />
              <h2 className="text-base font-semibold text-[#e6edf3]">
                Sinkronisasi Akun Instagram & TikTok Anda
              </h2>
            </div>
            <p className="text-xs text-[#8b949e] max-w-2xl leading-relaxed">
              Hubungkan akun media sosial Anda ke SocialHub. Data username dan followers yang terhubung akan langsung tampil di seluruh grafik Dashboard, statistik analitik, dan preview pembuat konten.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleOpenAddModal()}
              className="bg-[#238636] hover:bg-[#2ea043] text-white"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Hubungkan Akun Saya
            </Button>
          </div>
        </div>
      </Card>

      {/* Connected Accounts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#e6edf3]">
              Akun Media Sosial Terhubung
            </h2>
            <p className="text-xs text-[#8b949e]">
              Akun yang aktif digunakan untuk analitik dan perencanaan konten di SocialHub
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isTtApi && (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#3fb950] font-medium bg-[#3fb950]/10 border border-[#3fb950]/30 px-2.5 py-1 rounded-full">
                <span className="h-2 w-2 rounded-full bg-[#3fb950] animate-pulse"></span>
                Auto-Sync Aktif
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadAccounts(true)}
              disabled={loading}
              className="text-xs text-[#8b949e] hover:text-[#e6edf3]"
            >
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#21262d]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 rounded bg-[#21262d]" />
                    <div className="h-3 w-40 rounded bg-[#21262d]" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : accounts.length > 0 ? (
          <div className="space-y-4">
            {/* Tanda Verifikasi Akun TikTok API Resmi Aktif */}
            {ttAccount && isTtApi ? (
              <div className="rounded-2xl border border-[#3fb950]/40 bg-[#3fb950]/10 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black border border-[#30363d] text-white">
                      <TikTok className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#3fb950]"></span>
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#e6edf3]">
                          Akun TikTok Terintegrasi API: {ttAccount.username}
                        </h4>
                        <span className="rounded-full bg-[#3fb950]/20 px-2 py-0.5 text-[10px] font-semibold text-[#3fb950] border border-[#3fb950]/40">
                          🟢 LIVE API CONNECTED
                        </span>
                      </div>
                      <p className="text-xs text-[#8b949e] mt-0.5">
                        Metrik followers, following, & postingan otomatis tersinkron real-time dari TikTok Developer API.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://tiktok.com/@${ttAccount.username.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#30363d] bg-[#161b22] px-3.5 py-1.5 text-xs font-semibold text-[#e6edf3] hover:border-[#58a6ff]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Buka Profil
                    </a>
                  </div>
                </div>
              </div>
            ) : ttAccount && !isTtApi ? (
              <div className="rounded-2xl border border-[#f0883e]/40 bg-[#f0883e]/10 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black border border-[#f0883e]/40 text-[#f0883e]">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#e6edf3]">
                          Akun {ttAccount.username} Masih Mode Manual
                        </h4>
                        <span className="rounded-full bg-[#f0883e]/20 px-2 py-0.5 text-[10px] font-semibold text-[#f0883e] border border-[#f0883e]/40">
                          ⚠️ Belum Terintegrasi API Resmi
                        </span>
                      </div>
                      <p className="text-xs text-[#8b949e] mt-0.5 max-w-xl">
                        Penambahan following & followers di TikTok tidak update otomatis karena belum terhubung via API resmi TikTok Developer.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOAuthConnect('tiktok')}
                      className="bg-[#e6edf3] text-black hover:bg-[#c9d1d9] text-xs font-semibold"
                    >
                      <TikTok className="mr-1.5 h-3.5 w-3.5" />
                      Hubungkan via OAuth TikTok
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              {accounts.map((account) => {
                const isIg = account.platform === 'instagram';
                const isApi = isApiConnected(account);

                return (
                  <Card key={account.id} className="relative overflow-hidden border-[#30363d] bg-[#161b22]">
                    {/* Top accent */}
                    <div
                      className={`absolute left-0 right-0 top-0 h-1 ${
                        isIg
                          ? 'bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737]'
                          : 'bg-gradient-to-r from-[#00f2fe] to-[#4facfe]'
                      }`}
                    />
                    <div className="flex items-start gap-4 pt-2">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 ${
                          isIg
                            ? 'bg-gradient-to-br from-[#833AB4]/20 via-[#E1306C]/20 to-[#F77737]/20 text-[#E1306C]'
                            : 'bg-[#e6edf3]/10 text-white'
                        }`}
                      >
                        {account.profile_pic ? (
                          <img
                            src={account.profile_pic}
                            alt={account.username}
                            className="h-12 w-12 rounded-2xl object-cover"
                          />
                        ) : isIg ? (
                          <Instagram className="h-6 w-6" />
                        ) : (
                          <TikTok className="h-6 w-6" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <h3 className="font-semibold capitalize text-[#e6edf3] text-sm">
                              {account.platform}
                            </h3>
                            {isApi ? (
                              <Badge variant="success" className="text-[10px] px-1.5 py-0">
                                <CheckCircle2 className="mr-1 h-2.5 w-2.5" />
                                API Terhubung
                              </Badge>
                            ) : (
                              <Badge variant="warning" className="text-[10px] px-1.5 py-0 bg-[#f0883e]/15 text-[#f0883e] border-[#f0883e]/30">
                                Input Manual
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditAccount(account)}
                              className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#21262d] transition-colors"
                              title="Edit Data Akun"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAccount(account.id, account.username)}
                              className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#da3633] hover:bg-[#21262d] transition-colors"
                              title="Putuskan Akun"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="mt-0.5 text-sm font-medium text-[#58a6ff] truncate">
                          {account.username}
                        </p>

                        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#21262d] pt-2.5 text-xs">
                          <div>
                            <p className="text-[11px] text-[#8b949e]">Followers</p>
                            <p className="font-semibold text-[#e6edf3]">
                              {formatThousands(account.follower_count)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-[#8b949e]">Following</p>
                            <p className="font-semibold text-[#e6edf3]">
                              {formatThousands(account.following_count)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-[#8b949e]">Posts</p>
                            <p className="font-semibold text-[#e6edf3]">
                              {formatThousands(account.post_count)}
                            </p>
                          </div>
                        </div>

                        {!isApi && (
                          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-[#21262d]/60 px-2.5 py-1.5 text-[11px]">
                            <span className="text-[#8b949e]">Mode manual (tidak auto-update)</span>
                            <button
                              onClick={() => handleOAuthConnect(account.platform)}
                              className="font-medium text-[#58a6ff] hover:underline"
                            >
                              Hubungkan OAuth →
                            </button>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <a
                            href={
                              isIg
                                ? `https://instagram.com/${account.username.replace('@', '')}`
                                : `https://tiktok.com/@${account.username.replace('@', '')}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-[#8b949e] hover:text-[#58a6ff] hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Buka Profil
                          </a>

                          <a
                            href="/dashboard/post"
                            className="text-[11px] text-[#3fb950] font-medium hover:underline flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            Buat Konten
                          </a>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <Card className="border-dashed border-[#30363d] bg-[#161b22]/50 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#58a6ff]/10 text-[#58a6ff]">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-[#e6edf3]">
              Belum Ada Akun yang Dihubungkan
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-[#8b949e]">
              Hubungkan akun Instagram atau TikTok Anda agar Dashboard menampilkan data statistik nyata, followers asli, dan nama akun Anda di preview postingan.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Button
                onClick={() => handleOpenAddModal('instagram')}
                className="bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] hover:opacity-95 text-white text-xs"
              >
                <Instagram className="mr-1.5 h-3.5 w-3.5" />
                Hubungkan Instagram
              </Button>
              <Button
                onClick={() => handleOpenAddModal('tiktok')}
                className="bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#e6edf3] text-xs"
              >
                <TikTok className="mr-1.5 h-3.5 w-3.5" />
                Hubungkan TikTok
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Integrasi Developer Resmi (Meta & TikTok) */}
      <div className="pt-2">
        <h2 className="mb-2 text-lg font-semibold text-[#e6edf3]">
          Integrasi Developer Resmi (OAuth API)
        </h2>
        <p className="mb-4 text-xs text-[#8b949e]">
          Hubungkan akun melalui OAuth API resmi Meta atau TikTok Developer agar metrik followers, following, likes, dan postingan bertambah & terupdate otomatis secara real-time:
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Connect Instagram */}
          <Card className="flex flex-col items-center py-6 text-center border-[#30363d] bg-[#161b22]">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#833AB4]/20 via-[#E1306C]/20 to-[#F77737]/20">
              <Instagram className="h-7 w-7 text-[#E1306C]" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-[#e6edf3]">Instagram Graph API</h3>
            <p className="mb-4 text-xs text-[#8b949e] max-w-xs">
              Gunakan Meta App (Instagram Tester) gratis tanpa verifikasi bisnis
            </p>
            {isIgApi ? (
              <div className="flex flex-col items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3fb950]/30 bg-[#3fb950]/15 px-3 py-1.5 text-xs font-semibold text-[#3fb950]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Akun Sudah Terhubung Resmi ({igAccount?.username})
                </span>
                <span className="text-[11px] text-[#8b949e]">Status Database & API Graph Aktif</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleOAuthConnect('instagram')}
                    className="bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] hover:opacity-90 text-xs"
                  >
                    OAuth Meta
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenAddModal('instagram')}
                    className="text-xs"
                  >
                    Input Cepat
                  </Button>
                </div>
                {igAccount && (
                  <span className="text-[11px] text-[#8b949e]">
                    Akun {igAccount.username} saat ini masih mode manual. Klik OAuth Meta untuk auto-update API.
                  </span>
                )}
              </div>
            )}
          </Card>

          {/* Connect TikTok */}
          <Card className="flex flex-col items-center py-6 text-center border-[#30363d] bg-[#161b22]">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6edf3]/10">
              <TikTok className="h-7 w-7 text-white" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-[#e6edf3]">TikTok Open API</h3>
            <p className="mb-4 text-xs text-[#8b949e] max-w-xs">
              Client Key sudah terkonfigurasi di sistem SocialHub
            </p>
            {isTtApi ? (
              <div className="flex flex-col items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3fb950]/30 bg-[#3fb950]/15 px-3 py-1.5 text-xs font-semibold text-[#3fb950]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Akun Sudah Terhubung Resmi ({ttAccount?.username})
                </span>
                <span className="text-[11px] text-[#3fb950] font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950] animate-pulse"></span>
                  Auto-Sync Otomatis Aktif
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleOAuthConnect('tiktok')}
                    className="bg-[#e6edf3] text-black hover:bg-[#c9d1d9] text-xs font-semibold"
                  >
                    OAuth TikTok
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenAddModal('tiktok')}
                    className="text-xs"
                  >
                    Input Cepat
                  </Button>
                </div>
                {ttAccount && (
                  <span className="text-[11px] text-[#8b949e] max-w-xs text-center mt-0.5">
                    Akun {ttAccount.username} masih mode manual. Klik OAuth TikTok untuk auto-update followers & following dari API Sandbox.
                  </span>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal Hubungkan / Edit Akun */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#30363d] bg-[#161b22] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                {platform === 'instagram' ? (
                  <Instagram className="h-5 w-5 text-[#E1306C]" />
                ) : (
                  <TikTok className="h-5 w-5 text-white" />
                )}
                <h3 className="text-base font-semibold text-[#e6edf3]">
                  Hubungkan Akun {platform === 'instagram' ? 'Instagram' : 'TikTok'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="mt-4 space-y-4">
              {/* Platform Toggle */}
              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                  Platform
                </label>
                <div className="grid grid-cols-2 gap-2">
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
                    Instagram
                  </button>
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
                    TikTok
                  </button>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1">
                  Username Akun Anda <span className="text-[#da3633]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#8b949e]">@</span>
                  <input
                    type="text"
                    required
                    placeholder="contoh: bowxlss"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                    className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] pl-7 pr-3 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#8b949e]">
                  Username ini akan tampil di seluruh live preview dan analitik
                </p>
              </div>

              {/* Followers & Following */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1">
                    Jumlah Followers
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 15400"
                    value={followerCount}
                    onChange={(e) => setFollowerCount(e.target.value)}
                    className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-3 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1">
                    Following
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 350"
                    value={followingCount}
                    onChange={(e) => setFollowingCount(e.target.value)}
                    className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-3 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Post & Avatar URL */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1">
                    Total Postingan
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 42"
                    value={postCount}
                    onChange={(e) => setPostCount(e.target.value)}
                    className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-3 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1">
                    URL Foto Profil (Opsional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={profilePic}
                    onChange={(e) => setProfilePic(e.target.value)}
                    className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-3 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-[#30363d]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Akun'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
