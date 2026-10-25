'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Mohon isi semua field!');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Password tidak cocok!');
      return;
    }

    if (password.length < 6) {
      toast.error('Password minimal 6 karakter!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Registrasi gagal!', { duration: 6000 });
        setLoading(false);
        return;
      }

      if (data.hasSession) {
        login({ name: data.user.name, email: data.user.email });
        toast.success('Registrasi berhasil! Masuk ke dashboard...');
        router.push('/dashboard');
      } else {
        toast.success('Akun berhasil didaftarkan ke Supabase! Silakan login sekarang.', {
          duration: 6000,
        });
        router.push('/login');
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[#3fb950]/5 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-[#58a6ff]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#58a6ff]/10 text-xl">
              📱
            </div>
            <span className="text-2xl font-bold text-[#e6edf3]">SocialHub</span>
          </Link>
        </div>

        <Card className="p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[#e6edf3]">Buat Akun</h1>
            <p className="mt-1 text-sm text-[#8b949e]">Daftar untuk mulai mengelola sosmed kamu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="Nama Lengkap"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <User className="pointer-events-none absolute right-3 top-[38px] h-4 w-4 text-[#8b949e]" />
            </div>

            <div className="relative">
              <Input
                label="Email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="pointer-events-none absolute right-3 top-[38px] h-4 w-4 text-[#8b949e]" />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="pointer-events-none absolute right-3 top-[38px] h-4 w-4 text-[#8b949e]" />
            </div>

            <div className="relative">
              <Input
                label="Konfirmasi Password"
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Lock className="pointer-events-none absolute right-3 top-[38px] h-4 w-4 text-[#8b949e]" />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Daftar
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#8b949e]">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-[#58a6ff] hover:underline">
              Login di sini
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
