import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Call Supabase Auth to authenticate
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    // STRICT CHECK: Reject if credentials wrong or user does not exist!
    if (error) {
      let friendlyError = error.message;

      if (error.message.toLowerCase().includes('invalid login credentials')) {
        friendlyError = 'Akun tidak ditemukan atau password salah! Silakan register terlebih dahulu jika belum punya akun.';
      } else if (error.message.toLowerCase().includes('email not confirmed')) {
        friendlyError = 'Email belum diverifikasi. Cek inbox email kamu, atau matikan opsi "Confirm email" di Supabase Dashboard (Authentication > Providers > Email) untuk login langsung.';
      }

      return NextResponse.json(
        { error: friendlyError },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Gagal melakukan login' },
        { status: 401 }
      );
    }

    // Set secure persistent session cookies (30 days)
    const cookieStore = await cookies();
    cookieStore.set('session_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    cookieStore.set('user_id', data.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    cookieStore.set('socialhub_logged_in', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: userName,
      },
      message: 'Login berhasil',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
