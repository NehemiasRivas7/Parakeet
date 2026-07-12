import type { TipoContaminacion } from '@/lib/database.types';

// Tipos de contaminacion (RF-A02). Usados por el flujo de reporte y validados
// por POST /api/reportes.
export const TIPOS_CONTAMINACION: {
  value: TipoContaminacion;
  label: string;
  emoji: string;
}[] = [
  { value: 'basura', label: 'Basura', emoji: '🗑️' },
  { value: 'plastico', label: 'Plástico', emoji: '🧴' },
  { value: 'aguas_negras', label: 'Aguas negras', emoji: '💧' },
  { value: 'escombros', label: 'Escombros', emoji: '🧱' },
  { value: 'otro', label: 'Otro', emoji: '⚠️' },
];

export const TIPOS_VALUES: TipoContaminacion[] = TIPOS_CONTAMINACION.map(
  (t) => t.value,
);

export function labelTipo(value: TipoContaminacion): string {
  return TIPOS_CONTAMINACION.find((t) => t.value === value)?.label ?? value;
}
