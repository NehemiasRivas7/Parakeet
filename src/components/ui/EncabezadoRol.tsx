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
    <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
      <div>
        <Link href="/" className="text-xs text-neutral-400 underline">
          Parakeet
        </Link>
        <h1 className="text-lg font-bold leading-tight">{titulo}</h1>
        {subtitulo && (
          <p className="text-xs text-neutral-500">{subtitulo}</p>
        )}
      </div>
      <CerrarSesion />
    </header>
  );
}
