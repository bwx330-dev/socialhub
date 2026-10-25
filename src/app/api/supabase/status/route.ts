import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json({
        configured: false,
        tablesReady: false,
        message: 'NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi di .env.local',
      });
    }

    const supabase = await createServerSupabaseClient();

    // Test querying the posts table
    const { error: queryError } = await supabase
      .from('posts')
      .select('id')
      .limit(1);

    if (queryError) {
      // 42P01 is PostgreSQL code for "relation does not exist" (table missing)
      if (queryError.code === '42P01') {
        return NextResponse.json({
          configured: true,
          tablesReady: false,
          projectUrl: url,
          message: 'Koneksi ke Supabase berhasil! Tapi tabel "posts" belum dibuat. Buka SQL Editor di Supabase dan jalankan file supabase-schema.sql.',
        });
      }

      return NextResponse.json({
        configured: true,
        tablesReady: false,
        projectUrl: url,
        error: queryError.message,
        message: `Terhubung ke Supabase tapi ada kendala: ${queryError.message}`,
      });
    }

    return NextResponse.json({
      configured: true,
      tablesReady: true,
      projectUrl: url,
      message: 'Database Supabase terhubung & tabel posts aktif! ✅',
    });
  } catch (error) {
    return NextResponse.json(
      {
        configured: false,
        tablesReady: false,
        error: error instanceof Error ? error.message : 'Gagal cek status Supabase',
      },
      { status: 500 }
    );
  }
}
