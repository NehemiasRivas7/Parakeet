import { createClient } from '@supabase/supabase-js';

// Verificacion de conectividad a Supabase (Vercel -> env vars -> DB).
// Usa la anon key: tambien confirma que la RLS de lectura publica de zonas
// esta bien puesta. NO cachear: siempre golpea la DB.
export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return Response.json(
      { db: 'error', reason: 'faltan variables de entorno de Supabase' },
      { status: 500 },
    );
  }

  const supabase = createClient(url, anon);
  const { count, error } = await supabase
    .from('zonas')
    .select('*', { count: 'exact', head: true });

  if (error) {
    return Response.json(
      { db: 'error', reason: error.message },
      { status: 500 },
    );
  }

  return Response.json({
    db: 'ok',
    zonas: count ?? 0,
    timestamp: new Date().toISOString(),
  });
}
