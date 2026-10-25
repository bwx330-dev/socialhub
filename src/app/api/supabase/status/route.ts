import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rylmpuedkrwonsyeiqoi.supabase.co';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bG1wdWVka3J3b25zeWVpcW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4ODk0NzgsImV4cCI6MjEwODQ2NTQ3OH0.zk_JWBE-zES7ACXKYZNw9UFk9albSih_qI8euduykAQ';

    const supabase = await createServerSupabaseClient();

    // Test querying the posts table
    const { error: queryError } = await supabase
      .from('posts')
      .select('id')
      .limit(1);

    if (queryError) {
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
      message: 'Koneksi database Supabase aktif & siap digunakan!',
    });
  } catch (error) {
    console.error('Supabase status error:', error);
    return NextResponse.json({
      configured: false,
      tablesReady: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
