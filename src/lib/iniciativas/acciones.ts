'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireOrganizacion, requireEmpresa, requireEstudiante } from '@/lib/auth';
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

// ── Organizacion: editar (solo antes de financiada) ────────────────────────
export async function editarIniciativa(formData: FormData) {
  const { org } = await requireOrganizacion();
  const admin = createAdminClient();
  const id = String(formData.get('id') ?? '');

  const { data: actual } = await admin
    .from('iniciativas')
    .select('organizacion_id, estado')
    .eq('id', id)
    .single();
  if (!actual || actual.organizacion_id !== org.id) throw new Error('No autorizado');
  if (!['borrador', 'financiable'].includes(actual.estado)) {
    throw new Error('Solo se puede editar antes del financiamiento');
  }

  const nombre = String(formData.get('nombre') ?? '').trim();
  const descripcion = String(formData.get('descripcion') ?? '').trim();
  const tipo_causa = String(formData.get('tipo_causa') ?? '').trim();
  const fecha_jornada = String(formData.get('fecha_jornada') ?? '');
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
    redirect(`/organizacion/editar/${id}?error=campos`);
  }

  const zona_id = (await zonaMasCercana(admin, lat, lng)) ?? null;

  const { error } = await admin
    .from('iniciativas')
    .update({
      nombre,
      descripcion,
      tipo_causa,
      fecha_jornada,
      lat,
      lng,
      zona_id,
      cupo_max,
      horas_otorgadas,
      monto_requerido,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/organizacion');
  redirect('/organizacion');
}

// ── Organizacion: eliminar (solo antes de financiada) ──────────────────────
export async function eliminarIniciativa(formData: FormData) {
  const { org } = await requireOrganizacion();
  const admin = createAdminClient();
  const id = String(formData.get('id') ?? '');

  const { data: actual } = await admin
    .from('iniciativas')
    .select('organizacion_id, estado')
    .eq('id', id)
    .single();
  if (!actual || actual.organizacion_id !== org.id) throw new Error('No autorizado');
  if (!['borrador', 'financiable'].includes(actual.estado)) {
    throw new Error('Solo se puede eliminar antes del financiamiento');
  }

  const { error } = await admin.from('iniciativas').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/organizacion');
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
  revalidatePath('/estudiante');
}

// ── Organizacion: cerrar jornada (transaccional vía RPC) ───────────────────
export async function cerrarJornada(formData: FormData) {
  const { org } = await requireOrganizacion();
  const admin = createAdminClient();
  const id = String(formData.get('id') ?? '');

  const { data: ini } = await admin
    .from('iniciativas')
    .select('organizacion_id, estado, zona_id')
    .eq('id', id)
    .single();
  if (!ini || ini.organizacion_id !== org.id) throw new Error('No autorizado');
  if (!['inscripcion_abierta', 'en_curso'].includes(ini.estado)) {
    throw new Error('La jornada no se puede cerrar en este estado');
  }

  // Inscripciones marcadas como asistieron (checkboxes name="asistio").
  const asistieron = formData.getAll('asistio').map(String);

  // Métricas cuantificadas (arrays paralelos del formulario).
  const nombres = formData.getAll('metrica_nombre').map(String);
  const valores = formData.getAll('metrica_valor').map(String);
  const unidades = formData.getAll('metrica_unidad').map(String);
  const metricas = nombres
    .map((n, i) => ({
      metrica: n.trim(),
      valor: Number(valores[i]),
      unidad: (unidades[i] ?? '').trim(),
    }))
    .filter((m) => m.metrica && Number.isFinite(m.valor));

  const { error } = await admin.rpc('cerrar_jornada', {
    p_iniciativa: id,
    p_asistieron: asistieron,
    p_metricas: metricas,
  });
  if (error) throw new Error(error.message);

  revalidatePath('/organizacion');
  revalidatePath('/empresa/dashboard');
  revalidatePath('/estudiante');
  revalidatePath('/estudiante/horas');
  revalidatePath('/mapa');
  // Quedarse en la sesión de la organización: la misma página muestra el
  // resumen de impacto (antes/después). El color de la zona se actualiza solo.
  redirect(`/organizacion/jornada/${id}?cerrada=1`);
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
  revalidatePath('/empresa/dashboard');
  revalidatePath('/organizacion');
  redirect('/empresa?financiada=1');
}

// ── Estudiante: inscribirse a una iniciativa ───────────────────────────────
export async function inscribirse(formData: FormData) {
  const { estudiante } = await requireEstudiante();
  const admin = createAdminClient();
  const id = String(formData.get('id') ?? '');

  const { data: ini } = await admin
    .from('iniciativas')
    .select('estado, cupo_max')
    .eq('id', id)
    .single();
  if (!ini) throw new Error('Iniciativa no encontrada');
  if (ini.estado !== 'inscripcion_abierta') {
    redirect(`/estudiante/iniciativa/${id}?estado=cerrada`);
  }

  // Bloquear si el cupo esta lleno.
  const { count } = await admin
    .from('inscripciones')
    .select('*', { count: 'exact', head: true })
    .eq('iniciativa_id', id);
  if ((count ?? 0) >= ini.cupo_max) {
    redirect(`/estudiante/iniciativa/${id}?estado=lleno`);
  }

  const { error } = await admin
    .from('inscripciones')
    .insert({ iniciativa_id: id, estudiante_id: estudiante.id });
  if (error) {
    // 23505 = violacion de unique (iniciativa_id, estudiante_id) -> ya inscrito
    if (error.code === '23505') {
      redirect(`/estudiante/iniciativa/${id}?estado=duplicado`);
    }
    throw new Error(error.message);
  }

  revalidatePath('/estudiante');
  revalidatePath('/empresa/dashboard');
  revalidatePath('/organizacion');
  redirect(`/estudiante/iniciativa/${id}?estado=ok`);
}
