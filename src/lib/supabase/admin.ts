import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

// Cliente de servicio (service_role). SALTA RLS. Usar SOLO en codigo de servidor
// (Route Handlers /api, Server Actions) para escrituras que RLS bloquea a anon:
// transiciones de estado, financiamientos, cierre de jornada, etc.
// NUNCA importar esto en un Client Component: expondria la service_role key.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
