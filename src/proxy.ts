import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Next 16 renombro "middleware" -> "proxy". Refresca la sesion de Supabase.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Todas las rutas menos estaticos y /api (los handlers manejan su propia auth).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
