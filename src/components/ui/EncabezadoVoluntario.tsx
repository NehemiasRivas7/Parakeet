import Link from 'next/link';
import CerrarSesion from '@/components/ui/CerrarSesion';

// Encabezado del voluntario como perfil: avatar + nombre, lleva a su Green Passport.
export default function EncabezadoVoluntario({ nombre }: { nombre: string }) {
  return (
    <header className="flex items-center justify-between border-b border-brand-soft/70 bg-white/70 px-4 py-2.5 backdrop-blur-md">
      <Link
        href="/estudiante/horas"
        className="flex min-w-0 items-center gap-2.5"
        aria-label="Ver mi perfil"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.6 3.2-5.5 7-5.5s7 1.9 7 5.5" />
          </svg>
        </span>
        <div className="min-w-0">
          <div className="truncate font-bold leading-tight text-brand-dark">
            {nombre}
          </div>
          <div className="text-[11px] text-brand-mid">Ver mi perfil</div>
        </div>
      </Link>
      <CerrarSesion />
    </header>
  );
}
