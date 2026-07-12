import Link from 'next/link';
import CerrarSesion from '@/components/ui/CerrarSesion';

// Encabezado comun de las vistas autenticadas: titulo + rol + salir.
export default function EncabezadoRol({
  titulo,
  subtitulo,
}: {
  titulo: string;
  subtitulo?: string;
}) {
  return (
    <header className="flex items-center justify-between border-b border-brand-soft/70 bg-white/70 px-4 py-3 backdrop-blur-md">
      <div className="min-w-0">
        <Link
          href="/"
          className="text-[11px] font-semibold uppercase tracking-wide text-brand-mid"
        >
          Parakeet
        </Link>
        <h1 className="truncate text-lg font-bold leading-tight text-brand-dark">
          {titulo}
        </h1>
        {subtitulo && <p className="truncate text-xs text-muted">{subtitulo}</p>}
      </div>
      <CerrarSesion />
    </header>
  );
}
