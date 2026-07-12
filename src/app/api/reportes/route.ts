import { createAdminClient } from '@/lib/supabase/admin';
import { haversineM } from '@/lib/zonas/gravedad';
import { TIPOS_VALUES } from '@/lib/reportes/tipos';
import type { TipoContaminacion } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

function bad(reason: string) {
  return Response.json({ ok: false, reason }, { status: 400 });
}

// POST /api/reportes — crea un reporte anonimo (RF-A01/A02).
// Asigna zona por distancia Haversine < radio_m; si no cae en ninguna, crea una
// zona nueva. El trigger recalcular_gravedad_zona sube total_reportes y nivel.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad('JSON inválido');
  }

  const { lat, lng, tipo_contaminacion, descripcion } = (body ?? {}) as {
    lat?: unknown;
    lng?: unknown;
    tipo_contaminacion?: unknown;
    descripcion?: unknown;
  };

  if (typeof lat !== 'number' || !Number.isFinite(lat) || lat < -90 || lat > 90) {
    return bad('Latitud inválida');
  }
  if (typeof lng !== 'number' || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    return bad('Longitud inválida');
  }
  if (
    typeof tipo_contaminacion !== 'string' ||
    !TIPOS_VALUES.includes(tipo_contaminacion as TipoContaminacion)
  ) {
    return bad('Tipo de contaminación inválido');
  }
  const desc =
    typeof descripcion === 'string' && descripcion.trim().length > 0
      ? descripcion.trim().slice(0, 500)
      : null;

  const supabase = createAdminClient();

  // 1. Buscar la zona mas cercana dentro de su radio.
  const { data: zonas, error: zErr } = await supabase
    .from('zonas')
    .select('id, lat_centro, lng_centro, radio_m');
  if (zErr) {
    return Response.json({ ok: false, reason: zErr.message }, { status: 500 });
  }

  let zonaId: string | null = null;
  let best = Infinity;
  for (const z of zonas ?? []) {
    const d = haversineM(lat, lng, z.lat_centro, z.lng_centro);
    if (d <= z.radio_m && d < best) {
      best = d;
      zonaId = z.id;
    }
  }

  // 2. Si no cae en ninguna zona, crear una nueva centrada en el reporte.
  if (!zonaId) {
    const { data: nueva, error: nErr } = await supabase
      .from('zonas')
      .insert({
        nombre: 'Zona reportada',
        lat_centro: lat,
        lng_centro: lng,
        nivel_inicial: 'bajo',
      })
      .select('id')
      .single();
    if (nErr || !nueva) {
      return Response.json(
        { ok: false, reason: nErr?.message ?? 'No se pudo crear la zona' },
        { status: 500 },
      );
    }
    zonaId = nueva.id;
  }

  // 3. Insertar el reporte -> dispara el trigger de gravedad.
  const { data: reporte, error: rErr } = await supabase
    .from('reportes')
    .insert({
      lat,
      lng,
      tipo_contaminacion: tipo_contaminacion as TipoContaminacion,
      descripcion: desc,
      zona_id: zonaId,
    })
    .select('id, zona_id')
    .single();
  if (rErr || !reporte) {
    return Response.json(
      { ok: false, reason: rErr?.message ?? 'No se pudo crear el reporte' },
      { status: 500 },
    );
  }

  return Response.json(
    { ok: true, reporte_id: reporte.id, zona_id: zonaId },
    { status: 201 },
  );
}
