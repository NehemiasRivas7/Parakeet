import { COLOR_NIVEL, LABEL_NIVEL } from '@/lib/zonas/gravedad';
import type { NivelGravedad } from '@/lib/database.types';

// Antes/después de la zona. Imágenes estáticas (MVP): en producción las subiría
// la organización al crear/cerrar la jornada.
export default function TarjetaAntesDespues({
  nivelInicial,
  nivelActual,
}: {
  nivelInicial: NivelGravedad;
  nivelActual: NivelGravedad;
}) {
  return (
    <div className="pk-card overflow-hidden">
      <div className="grid grid-cols-2">
        <figure className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/before.png"
            alt="Zona antes de la jornada"
            className="h-32 w-full object-cover sm:h-40"
          />
          <figcaption className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-semibold text-white">
            Antes
          </figcaption>
        </figure>
        <figure className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/after.png"
            alt="Zona después de la jornada"
            className="h-32 w-full object-cover sm:h-40"
          />
          <figcaption className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">
            Después
          </figcaption>
        </figure>
      </div>
      <div className="flex items-center justify-center gap-3 p-3 text-sm font-medium">
        <span
          className="rounded-full px-2.5 py-0.5 text-white"
          style={{ backgroundColor: COLOR_NIVEL[nivelInicial] }}
        >
          {LABEL_NIVEL[nivelInicial]}
        </span>
        <span className="text-muted">→</span>
        <span
          className="rounded-full px-2.5 py-0.5 text-white"
          style={{ backgroundColor: COLOR_NIVEL[nivelActual] }}
        >
          {LABEL_NIVEL[nivelActual]}
        </span>
      </div>
    </div>
  );
}
