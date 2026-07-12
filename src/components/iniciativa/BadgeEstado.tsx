import { CLASE_ESTADO, LABEL_ESTADO } from '@/lib/iniciativas/estados';
import type { EstadoIniciativa } from '@/lib/database.types';

export default function BadgeEstado({ estado }: { estado: EstadoIniciativa }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${CLASE_ESTADO[estado]}`}
    >
      {LABEL_ESTADO[estado]}
    </span>
  );
}
