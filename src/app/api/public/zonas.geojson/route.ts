import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// GET /api/public/zonas.geojson — API PÚBLICA (coopetencia).
// Zonas agregadas con nivel de gravedad calculado a partir de los reportes.
export async function GET() {
  const admin = createAdminClient();
  const { data: zonas, error } = await admin
    .from('zonas')
    .select(
      'id, nombre, lat_centro, lng_centro, radio_m, nivel_gravedad, nivel_inicial, total_reportes, actualizada_en',
    );

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500, headers: CORS },
    );
  }

  const geojson = {
    type: 'FeatureCollection' as const,
    metadata: {
      nombre: 'Parakeet — Zonas contaminadas (agregado por gravedad)',
      descripcion:
        'Zonas con nivel de gravedad calculado por densidad de reportes ciudadanos: critico ≥10 · alto 5-9 · medio 2-4 · bajo 1 · recuperada tras jornada. Reto EcoTrack.',
      licencia: 'Datos abiertos — uso libre citando a Parakeet',
      total: zonas?.length ?? 0,
      generado_en: new Date().toISOString(),
    },
    features: (zonas ?? []).map((z) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [z.lng_centro, z.lat_centro],
      },
      properties: {
        id: z.id,
        nombre: z.nombre,
        nivel_gravedad: z.nivel_gravedad,
        nivel_inicial: z.nivel_inicial,
        total_reportes: z.total_reportes,
        radio_m: z.radio_m,
        actualizada_en: z.actualizada_en,
      },
    })),
  };

  return Response.json(geojson, {
    headers: { ...CORS, 'Content-Type': 'application/geo+json' },
  });
}
