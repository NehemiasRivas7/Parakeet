import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// CORS abierto: sin esto nadie puede consumir desde el browser y la coopetencia muere.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// GET /api/public/reportes.geojson — API PÚBLICA (coopetencia).
// Puntos contaminados auto-reportados por ciudadanos, en GeoJSON estándar
// (consumible por Leaflet, Mapbox, QGIS, etc. con una línea).
export async function GET() {
  const admin = createAdminClient();
  const { data: reportes, error } = await admin
    .from('reportes')
    .select('id, lat, lng, tipo_contaminacion, descripcion, creado_en, zona_id')
    .order('creado_en', { ascending: false });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500, headers: CORS },
    );
  }

  const geojson = {
    type: 'FeatureCollection' as const,
    metadata: {
      nombre: 'Parakeet — Reportes ciudadanos de puntos contaminados',
      descripcion:
        'Puntos contaminados auto-reportados por ciudadanos (anónimos, sin datos personales). Reto EcoTrack.',
      licencia: 'Datos abiertos — uso libre citando a Parakeet',
      total: reportes?.length ?? 0,
      generado_en: new Date().toISOString(),
    },
    features: (reportes ?? []).map((r) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        // GeoJSON es [lng, lat] — ojo con el orden.
        coordinates: [r.lng, r.lat],
      },
      properties: {
        id: r.id,
        tipo_contaminacion: r.tipo_contaminacion,
        descripcion: r.descripcion,
        reportado_en: r.creado_en,
        zona_id: r.zona_id,
      },
    })),
  };

  return Response.json(geojson, {
    headers: { ...CORS, 'Content-Type': 'application/geo+json' },
  });
}
