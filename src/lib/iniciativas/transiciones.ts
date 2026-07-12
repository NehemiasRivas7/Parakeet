import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, EstadoIniciativa } from '@/lib/database.types';

// ⚠️ MAQUINA DE ESTADOS — toda transicion de iniciativa pasa por aqui.
// Nunca escribir `update iniciativas set estado = ...` suelto en otro lado.
export const TRANSICIONES: Record<EstadoIniciativa, EstadoIniciativa[]> = {
  borrador: ['en_revision', 'cancelada'],
  en_revision: ['financiable', 'borrador', 'cancelada'],
  financiable: ['financiada', 'cancelada'],
  financiada: ['inscripcion_abierta', 'cancelada'],
  inscripcion_abierta: ['en_curso', 'cancelada'],
  en_curso: ['completada', 'cancelada'],
  completada: [],
  cancelada: [],
};

export function puedeTransicionar(
  actual: EstadoIniciativa,
  siguiente: EstadoIniciativa,
): boolean {
  return TRANSICIONES[actual]?.includes(siguiente) ?? false;
}

// Aplica una transicion validada sobre la iniciativa. Usa el cliente que se le
// pase (normalmente el admin/service-role desde un Server Action ya autorizado).
export async function aplicarTransicion(
  supabase: SupabaseClient<Database>,
  iniciativaId: string,
  siguiente: EstadoIniciativa,
): Promise<{ error: string | null }> {
  const { data: ini, error } = await supabase
    .from('iniciativas')
    .select('estado')
    .eq('id', iniciativaId)
    .single();
  if (error || !ini) return { error: 'Iniciativa no encontrada' };

  if (!puedeTransicionar(ini.estado, siguiente)) {
    return { error: `Transición inválida: ${ini.estado} → ${siguiente}` };
  }

  const { error: upErr } = await supabase
    .from('iniciativas')
    .update({ estado: siguiente })
    .eq('id', iniciativaId);
  if (upErr) return { error: upErr.message };

  return { error: null };
}
