'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  FileText,
  Clock,
  Heart,
  MessageCircle,
  Eye,
  Plus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Instagram, TikTok } from '@/components/ui/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatThousands } from '@/lib/utils';
import {
  engagementByType,
  bestTimeData,
  heatmapDays,
  heatmapHours,
} from '@/lib/mock-data';

interface ConnectedAccount {
  id: string;
  platform: 'instagram' | 'tiktok';
  username: string;
  follower_count: number;
  following_count: number;
  post_count: number;
  profile_pic?: string;
  is_active: boolean;
}

interface PostItem {
  id: string;
  platform: 'instagram' | 'tiktok';
  caption: string;
  scheduled_at: string;
  status: 'pending' | 'published' | 'failed' | 'cancelled';
  media_url?: string;
}

function getHeatmapClass(value: number): string {
  if (value >= 80) return 'bg-[#58a6ff]';
  if (value >= 60) return 'bg-[#58a6ff]/75';
  if (value >= 40) return 'bg-[#58a6ff]/50';
  if (value >= 20) return 'bg-[#58a6ff]/25';
  return 'bg-[#58a6ff]/10';
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-3 shadow-xl">
        <p className="mb-1 text-xs text-[#8b949e]">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {formatThousands(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch accounts
        const accRes = await fetch('/api/accounts');
        const accData = await accRes.json();
        if (accData.accounts) {
          setAccounts(accData.accounts);
        }

        // Fetch posts
        const postRes = await fetch('/api/posts');
        const postData = await postRes.json();
        if (postData.posts) {
          setPosts(postData.posts);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Auto-update when user returns to tab or every 15 seconds
    const handleFocus = () => fetchData();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchData();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchData();
    }, 15000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, []);

  // Compute metrics from connected accounts & posts
  const hasConnectedAccounts = accounts.length > 0;

  const totalFollowers = hasConnectedAccounts
    ? accounts.reduce((sum, a) => sum + (Number(a.follower_count) || 0), 0)
    : 14850;

  const scheduledCount = posts.filter((p) => p.status === 'pending').length;
  const postsThisWeek = posts.length > 0 ? posts.length : 8;

  // Generate dynamic follower growth points ending at user's actual follower count
  const growthPoints = [
    { date: '1 Okt', followers: Math.round(totalFollowers * 0.88) },
    { date: '5 Okt', followers: Math.round(totalFollowers * 0.90) },
    { date: '10 Okt', followers: Math.round(totalFollowers * 0.92) },
    { date: '15 Okt', followers: Math.round(totalFollowers * 0.95) },
    { date: '20 Okt', followers: Math.round(totalFollowers * 0.98) },
    { date: '25 Okt', followers: totalFollowers },
  ];

  const summaryCards = [
    {
      title: 'Total Followers',
      value: formatThousands(totalFollowers),
      trend: 4.8,
      icon: Users,
      color: '#58a6ff',
      subtitle: hasConnectedAccounts
        ? `${accounts.length} akun terhubung`
        : 'Akun demo (hubungkan akun Anda)',
    },
    {
      title: 'Engagement Rate',
      value: '4.2%',
      trend: 0.5,
      icon: Activity,
      color: '#3fb950',
      subtitle: 'Rata-rata 30 hari',
    },
    {
      title: 'Total Postingan',
      value: (hasConnectedAccounts
        ? accounts.reduce((sum, a) => sum + (Number(a.post_count) || 0), 0) + posts.length
        : postsThisWeek
      ).toString(),
      trend: 12.5,
      icon: FileText,
      color: '#bc8cff',
      subtitle: 'Postingan terkelola',
    },
    {
      title: 'Jadwal di Antrean',
      value: scheduledCount.toString(),
      trend: 0,
      icon: Clock,
      color: '#d29922',
      subtitle: 'Jadwal di kalender',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Account Status Header Bar */}
      {hasConnectedAccounts ? (
        <Card className="border-[#3fb950]/30 bg-[#161b22] p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className={`flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-[#161b22] ${
                      acc.platform === 'instagram'
                        ? 'bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] text-white'
                        : 'bg-black text-white border border-[#30363d]'
                    }`}
                  >
                    {acc.platform === 'instagram' ? (
                      <Instagram className="h-4 w-4" />
                    ) : (
                      <TikTok className="h-4 w-4" />
                    )}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[#e6edf3]">
                    Akun Aktif: {accounts.map((a) => a.username).join(', ')}
                  </h2>
                  <Badge variant="success" className="text-[10px] px-1.5 py-0">
                    <CheckCircle2 className="mr-1 h-2.5 w-2.5" />
                    Live Data
                  </Badge>
                </div>
                <p className="text-xs text-[#8b949e]">
                  Dashboard terkonfigurasi sesuai data akun media sosial Anda.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/accounts"
                className="text-xs text-[#58a6ff] hover:underline font-medium flex items-center gap-1"
              >
                Kelola Akun
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                href="/dashboard/post"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#238636] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2ea043] transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Buat Post Baru
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-[#30363d] bg-gradient-to-r from-[#161b22] via-[#161b22] to-[#58a6ff]/10 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#58a6ff]/15 text-[#58a6ff]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#e6edf3]">
                  Hubungkan Akun Instagram & TikTok Anda
                </h2>
                <p className="text-xs text-[#8b949e]">
                  Agar metrik, followers, dan preview postingan sesuai dengan akun nyata Anda, masukkan akun di menu Akun Sosmed.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/accounts"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#238636] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2ea043] transition-all whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              Hubungkan Akun Sekarang
            </Link>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#8b949e]">{card.title}</p>
                <p suppressHydrationWarning className="mt-1 text-2xl font-bold text-[#e6edf3]">
                  {card.value}
                </p>
                <p className="mt-0.5 text-[11px] text-[#8b949e]">{card.subtitle}</p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <card.icon className="h-5 w-5" style={{ color: card.color }} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              {card.trend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-[#3fb950]" />
              ) : (
                <TrendingDown className="h-4 w-4 text-[#da3633]" />
              )}
              <span
                className={`text-sm font-medium ${
                  card.trend >= 0 ? 'text-[#3fb950]' : 'text-[#da3633]'
                }`}
              >
                {card.trend >= 0 ? '+' : ''}
                {card.trend}%
              </span>
              <span className="text-xs text-[#8b949e]">vs minggu lalu</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Followers Growth Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Pertumbuhan Followers</CardTitle>
              <p className="text-xs text-[#8b949e] mt-0.5">
                {hasConnectedAccounts
                  ? `Berdasarkan akun ${accounts.map((a) => a.username).join(' & ')}`
                  : 'Pertumbuhan 30 hari terakhir'}
              </p>
            </div>
            <Badge variant="info" className="text-xs">
              {formatThousands(totalFollowers)} Total
            </Badge>
          </CardHeader>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#8b949e', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#30363d' }}
                />
                <YAxis
                  tick={{ fill: '#8b949e', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#30363d' }}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="followers"
                  name="Followers"
                  stroke="#58a6ff"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#58a6ff', stroke: '#0d1117', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Engagement by Post Type */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement per Jenis Konten</CardTitle>
          </CardHeader>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementByType} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis
                  dataKey="type"
                  tick={{ fill: '#8b949e', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#30363d' }}
                />
                <YAxis
                  tick={{ fill: '#8b949e', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#30363d' }}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span style={{ color: '#8b949e', fontSize: '12px' }}>{value}</span>
                  )}
                />
                <Bar dataKey="likes" name="Likes" fill="#58a6ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comments" name="Comments" fill="#3fb950" radius={[4, 4, 0, 0]} />
                <Bar dataKey="shares" name="Shares" fill="#bc8cff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Konten Terjadwal & Perencanaan Terbaru */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daftar Konten Anda (Supabase)</CardTitle>
            <Link
              href="/dashboard/scheduler"
              className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1"
            >
              Lihat Kalender
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {posts.length > 0 ? (
              posts.slice(0, 4).map((post, idx) => (
                <div
                  key={post.id}
                  className="flex items-center gap-3 rounded-xl border border-[#30363d] bg-[#0d1117] p-3 transition-colors hover:border-[#58a6ff]/30"
                >
                  <div className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-lg bg-[#21262d] text-sm font-bold text-[#8b949e]">
                    #{idx + 1}
                  </div>

                  <div className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-lg bg-gradient-to-br from-[#58a6ff]/20 to-[#bc8cff]/20">
                    {post.platform === 'instagram' ? (
                      <Instagram className="h-5 w-5 text-[#bc8cff]" />
                    ) : (
                      <TikTok className="h-5 w-5 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[#e6edf3]">
                      {post.caption || 'Tanpa judul'}
                    </p>
                    <p className="text-xs text-[#8b949e]">
                      {new Date(post.scheduled_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <Badge
                    variant={post.status === 'published' ? 'success' : 'info'}
                    className="text-[10px] capitalize"
                  >
                    {post.status === 'pending' ? 'Terjadwal' : post.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[#30363d] p-6 text-center">
                <FileText className="mx-auto h-8 w-8 text-[#8b949e] mb-2" />
                <p className="text-xs text-[#8b949e]">Belum ada konten tersimpan di Supabase</p>
                <Link
                  href="/dashboard/post"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#e6edf3] hover:border-[#58a6ff] border border-[#30363d]"
                >
                  <Plus className="h-3 w-3" />
                  Buat Konten Pertama
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Best Time to Post Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Waktu Terbaik Posting (Prime Time)</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-1 text-xs font-medium text-[#8b949e]" />
                  {heatmapHours.map((h) => (
                    <th key={h} className="p-1 text-center text-[10px] font-medium text-[#8b949e]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapDays.map((day) => (
                  <tr key={day}>
                    <td className="p-1 text-xs font-medium text-[#8b949e] whitespace-nowrap">
                      {day}
                    </td>
                    {heatmapHours.map((hour) => {
                      const cell = bestTimeData.find(
                        (d) => d.day === day && d.hour === `${hour}:00`
                      );
                      return (
                        <td key={`${day}-${hour}`} className="p-0.5">
                          <div
                            suppressHydrationWarning
                            className={`h-6 w-full min-w-[20px] rounded-sm transition-colors ${getHeatmapClass(
                              cell?.value || 0
                            )}`}
                            title={`${day} ${hour}:00 — ${cell?.value || 0}% engagement`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Legend */}
            <div className="mt-3 flex items-center justify-end gap-2 text-xs text-[#8b949e]">
              <span>Rendah</span>
              {[10, 25, 50, 75, 90].map((v, i) => (
                <div key={i} className={`h-3 w-5 rounded-sm ${getHeatmapClass(v)}`} />
              ))}
              <span>Tinggi</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
