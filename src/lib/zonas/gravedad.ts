import type { NivelGravedad } from '@/lib/database.types';

// Radio de la Tierra en metros
const R = 6_371_000;

// Distancia Haversine entre dos coordenadas, en metros.
export function haversineM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Nivel de gravedad por numero de reportes. Debe coincidir con el trigger
// recalcular_gravedad_zona en supabase/functions.sql.
export function nivelPorReportes(n: number): NivelGravedad {
  if (n >= 10) return 'critico';
  if (n >= 5) return 'alto';
  if (n >= 2) return 'medio';
  return 'bajo';
}

// Colores por nivel (RF-A: recuperada verde ... critico rojo)
export const COLOR_NIVEL: Record<NivelGravedad, string> = {
  recuperada: '#22c55e',
  bajo: '#eab308',
  medio: '#f97316',
  alto: '#f43f5e',
  critico: '#dc2626',
};

export const LABEL_NIVEL: Record<NivelGravedad, string> = {
  recuperada: 'Recuperada',
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
  critico: 'Crítico',
};
