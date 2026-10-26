import { notFound } from 'next/navigation';
import { ExternalLink, Globe, MessageCircle, ShoppingBag } from 'lucide-react';
import { TikTok, Instagram } from '@/components/ui/icons';

export const dynamic = 'force-dynamic';

export default async function PublicBioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const cleanUsername = username.replace(/^@/, '');

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col items-center justify-between p-4 py-12">
      <div className="w-full max-w-sm space-y-6 text-center">
        {/* Profile Avatar */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-[#30363d] to-[#161b22] p-1 border-2 border-[#58a6ff] shadow-xl">
          <span className="text-2xl font-bold text-white uppercase">
            {cleanUsername.charAt(0)}
          </span>
        </div>

        {/* Display Name & Username */}
        <div>
          <h1 className="text-lg font-bold text-white">
            {cleanUsername}
          </h1>
          <p className="text-xs text-[#8b949e] font-mono">
            @{cleanUsername}
          </p>
        </div>

        {/* Bio */}
        <p className="text-xs text-[#8b949e] leading-relaxed max-w-xs mx-auto">
          Official Links & Social Channels | Powered by SocialHub
        </p>

        {/* Links List */}
        <div className="space-y-3 pt-2">
          <a
            href={`https://tiktok.com/@${cleanUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-[#30363d] bg-[#161b22] hover:bg-[#21262d] p-3.5 text-xs font-semibold text-white transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <TikTok className="h-4 w-4" />
              <span>Ikuti di TikTok</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-[#8b949e]" />
          </a>

          <a
            href={`https://instagram.com/${cleanUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-[#30363d] bg-[#161b22] hover:bg-[#21262d] p-3.5 text-xs font-semibold text-white transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Instagram className="h-4 w-4 text-[#E1306C]" />
              <span>Ikuti di Instagram</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-[#8b949e]" />
          </a>
        </div>
      </div>

      <div className="pt-12 text-center text-xs text-[#8b949e]">
        Created with <strong className="text-[#58a6ff]">SocialHub</strong> · Unified Social Media Suite
      </div>
    </div>
  );
}
