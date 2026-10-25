'use client';

import Link from 'next/link';
import {
  BarChart3,
  Calendar,
  Layers,
  Radio,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Monitor performa konten secara real-time dengan visualisasi data yang powerful.',
    color: '#58a6ff',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduler',
    description: 'Jadwalkan posting di waktu terbaik. Otomatis publish ke semua platform.',
    color: '#3fb950',
  },
  {
    icon: Layers,
    title: 'Multi-Platform',
    description: 'Kelola Instagram, TikTok, dan platform lainnya dari satu dashboard.',
    color: '#bc8cff',
  },
  {
    icon: Radio,
    title: 'Live Manager',
    description: 'Pantau engagement real-time dan respon komentar langsung dari SocialHub.',
    color: '#d29922',
  },
];

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '1M+', label: 'Posts Scheduled' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-[#58a6ff]/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#bc8cff]/5 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#3fb950]/5 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#58a6ff]/10 text-lg">
            📱
          </div>
          <span className="text-xl font-bold text-[#e6edf3]">SocialHub</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center px-6 pt-20 pb-16 text-center max-w-5xl mx-auto">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-4 py-1.5 text-sm text-[#8b949e]">
          <Sparkles className="h-4 w-4 text-[#d29922]" />
          Powerful Social Media Management
        </div>

        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-[#e6edf3] sm:text-6xl md:text-7xl">
          📱 Social
          <span className="bg-gradient-to-r from-[#58a6ff] to-[#bc8cff] bg-clip-text text-transparent">
            Hub
          </span>
        </h1>

        <p className="mb-4 text-2xl font-semibold text-[#e6edf3] sm:text-3xl">
          Social Media Command Center
        </p>

        <p className="mb-10 max-w-2xl text-lg text-[#8b949e] leading-relaxed">
          Kelola semua akun sosial media dari satu tempat. Jadwalkan postingan,
          analisis performa, dan tingkatkan engagement — semuanya dalam satu dashboard.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/login">
            <Button size="lg" className="text-base">
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg" className="text-base">
              <Zap className="h-5 w-5 text-[#d29922]" />
              Live Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-20">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[#30363d] bg-[#161b22]/60 backdrop-blur-sm p-5 text-center"
            >
              <div className="text-2xl font-bold text-[#58a6ff]">{stat.value}</div>
              <div className="mt-1 text-sm text-[#8b949e]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-[#e6edf3]">
            Everything You Need
          </h2>
          <p className="text-[#8b949e] text-lg">
            Semua fitur yang kamu butuhkan untuk scale up sosial media.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-[#30363d] bg-[#161b22]/60 backdrop-blur-sm p-6 transition-all duration-300 hover:border-[#58a6ff]/30 hover:bg-[#161b22]"
            >
              <div
                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#e6edf3]">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#8b949e]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 text-center">
        <div className="rounded-2xl border border-[#30363d] bg-gradient-to-br from-[#161b22] to-[#0d1117] p-12">
          <Shield className="mx-auto mb-4 h-10 w-10 text-[#3fb950]" />
          <h2 className="mb-3 text-3xl font-bold text-[#e6edf3]">
            Siap Mulai?
          </h2>
          <p className="mb-8 text-[#8b949e] text-lg">
            Daftar gratis dan mulai kelola sosial media kamu hari ini.
          </p>
          <Link href="/register">
            <Button size="lg">
              Buat Akun Gratis
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#30363d] py-8 text-center text-sm text-[#8b949e]">
        <p>© 2026 SocialHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
