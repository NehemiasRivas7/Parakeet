'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireOrganizacion, requireEmpresa } from '@/lib/auth';
import { aplicarTransicion } from '@/lib/iniciativas/transiciones';
import { haversineM } from '@/lib/zonas/gravedad';

// Busca la zona mas cercana a un punto dentro de su radio (misma logica que
// POST /api/reportes). Devuelve el id o null.
async function zonaMasCercana(
  admin: ReturnType<typeof createAdminClient>,
  lat: number,
  lng: number,
): Promise<string | null> {
  const { data: zonas } = await admin
    .from('zonas')
    .select('id, lat_centro, lng_centro, radio_m');
  let zonaId: string | null = null;
  let best = Infinity;
  for (const z of zonas ?? []) {
    const d = haversineM(lat, lng, z.lat_centro, z.lng_centro);
    if (d <= z.radio_m && d < best) {
      best = d;
      zonaId = z.id;
    }
  }
  return zonaId;
}

// Verifica que una iniciativa pertenece a la organizacion dada.
async function esDeLaOrg(
  admin: ReturnType<typeof createAdminClient>,
  iniciativaId: string,
  orgId: string,
): Promise<boolean> {
  const { data } = await admin
    .from('iniciativas')
    .select('organizacion_id')
    .eq('id', iniciativaId)
    .single();
  return data?.organizacion_id === orgId;
}

// ── Organizacion: crear iniciativa (queda en borrador) ─────────────────────
export async function crearIniciativa(formData: FormData) {
  const { org } = await requireOrganizacion();
  const admin = createAdminClient();

  const nombre = String(formData.get('nombre') ?? '').trim();
  const descripcion = String(formData.get('descripcion') ?? '').trim();
  const tipo_causa = String(formData.get('tipo_causa') ?? '').trim();
  const fecha_jornada = String(formData.get('fecha_jornada') ?? '');
  let zona_id = String(formData.get('zona_id') ?? '') || null;
  const lat = Number(formData.get('lat'));
  const lng = Number(formData.get('lng'));
  const cupo_max = Number(formData.get('cupo_max'));
  const horas_otorgadas = Number(formData.get('horas_otorgadas'));
  const monto_requerido = Number(formData.get('monto_requerido'));

  if (
    !nombre ||
    !descripcion ||
    !tipo_causa ||
    !fecha_jornada ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !Number.isFinite(cupo_max) ||
    cupo_max <= 0 ||
    !Number.isFinite(horas_otorgadas) ||
    horas_otorgadas <= 0 ||
    !Number.isFinite(monto_requerido) ||
    monto_requerido < 0
  ) {
    redirect('/organizacion/nueva?error=campos');
  }

  // Si no vino zona explicita, auto-asignar la mas cercana al punto elegido.
  // Necesario para que el cierre de jornada (Plan 5) baje la gravedad de la zona.
  if (!zona_id) {
    zona_id = await zonaMasCercana(admin, lat, lng);
  }

  const { error } = await admin.from('iniciativas').insert({
    organizacion_id: org.id,
    zona_id,
    nombre,
    descripcion,
    tipo_causa,
    lat,
    lng,
    fecha_jornada,
    cupo_max,
    horas_otorgadas,
    monto_requerido,
    estado: 'borrador',
  });
  if (error) throw new Error(error.message);

  revalidatePath('/organizacion');
  redirect('/organizacion');
}

// ── Organizacion: publicar para financiamiento (borrador -> financiable) ───
// Sin paso de admin: la iniciativa queda visible a empresas de inmediato.
export async function publicarIniciativa(formData: FormData) {
  const { org } = await requireOrganizacion();
  const admin = createAdminClient();
  const id = String(formData.get('id') ?? '');
  if (!(await esDeLaOrg(admin, id, org.id))) throw new Error('No autorizado');

  const { error } = await aplicarTransicion(admin, id, 'financiable');
  if (error) throw new Error(error);
  revalidatePath('/organizacion');
}

// ── Organizacion: abrir inscripciones (financiada -> inscripcion_abierta) ──
export async function abrirInscripciones(formData: FormData) {
  const { org } = await requireOrganizacion();
  const admin = createAdminClient();
  const id = String(formData.get('id') ?? '');
  if (!(await esDeLaOrg(admin, id, org.id))) throw new Error('No autorizado');

  const { error } = await aplicarTransicion(admin, id, 'inscripcion_abierta');
  if (error) throw new Error(error);
  revalidatePath('/organizacion');
}

// ── Empresa: financiar (financiable -> financiada) + registro ──────────────
export async function financiarIniciativa(formData: FormData) {
  const { empresa } = await requireEmpresa();
  const admin = createAdminClient();
  const id = String(formData.get('id') ?? '');

  const { data: ini, error: iErr } = await admin
    .from('iniciativas')
    .select('estado, monto_requerido')
    .eq('id', id)
    .single();
  if (iErr || !ini) throw new Error('Iniciativa no encontrada');
  if (ini.estado !== 'financiable') throw new Error('La iniciativa ya no está disponible para financiar');

  // 1. Registrar el financiamiento (pago simulado).
  const { error: fErr } = await admin.from('financiamientos').insert({
    iniciativa_id: id,
    empresa_id: empresa.id,
    monto: ini.monto_requerido,
    estado_pago: 'simulado',
  });
  if (fErr) throw new Error(fErr.message);

  // 2. Transicion de estado.
  const { error } = await aplicarTransicion(admin, id, 'financiada');
  if (error) throw new Error(error);

  revalidatePath('/empresa');
  redirect('/empresa?financiada=1');
}
