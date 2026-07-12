import type { EstadoIniciativa } from '@/lib/database.types';

// Client-safe: labels y clases de color por estado (para badges).
export const LABEL_ESTADO: Record<EstadoIniciativa, string> = {
  borrador: 'Borrador',
  en_revision: 'En revisión',
  financiable: 'Financiable',
  financiada: 'Financiada',
  inscripcion_abierta: 'Inscripción abierta',
  en_curso: 'En curso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

// Clases Tailwind (fondo + texto) por estado.
export const CLASE_ESTADO: Record<EstadoIniciativa, string> = {
  borrador: 'bg-neutral-200 text-neutral-700',
  en_revision: 'bg-amber-100 text-amber-800',
  financiable: 'bg-sky-100 text-sky-800',
  financiada: 'bg-indigo-100 text-indigo-800',
  inscripcion_abierta: 'bg-emerald-100 text-emerald-800',
  en_curso: 'bg-teal-100 text-teal-800',
  completada: 'bg-green-600 text-white',
  cancelada: 'bg-red-100 text-red-700',
};
