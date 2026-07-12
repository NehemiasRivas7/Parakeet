import Link from 'next/link';
import MapaPublico from '@/components/mapa/MapaPublico';
import Logo from '@/components/ui/Logo';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ zona?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const reporteEnviado = sp.ok === '1';

  return (
    <main className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-brand-soft/70 bg-white/70 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Logo className="h-9 w-9 rounded-xl shadow-[0_6px_14px_-4px_rgba(16,148,45,0.5)]" />
          <div>
            <h1 className="text-lg font-bold leading-none text-brand-dark">
              Parakeet
            </h1>
            <p className="text-[11px] text-muted">Mapa de puntos contaminados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-brand-dark transition hover:bg-brand-tint"
          >
            Ingresar
          </Link>
          <Link href="/reportar" className="pk-btn pk-btn-accent px-4">
            + Reportar
          </Link>
        </div>
      </header>

      {reporteEnviado && (
        <div className="mx-4 mt-3 rounded-xl border border-brand-soft bg-brand-tint px-3 py-2 text-sm font-medium text-brand-dark">
          ¡Reporte recibido! Tu zona ya está marcada en el mapa.
        </div>
      )}

      <section className="relative min-h-0 flex-1 p-3">
        <div className="h-full w-full overflow-hidden rounded-2xl border border-brand-soft/70 shadow-[0_10px_30px_-14px_rgba(0,99,65,0.3)]">
          <MapaPublico focusZonaId={sp.zona} />
        </div>
      </section>

      <footer className="px-4 pb-3 text-center text-xs text-muted">
        Turismo ecológico y sostenible · Reto EcoTrack
      </footer>
    </main>
  );
}
