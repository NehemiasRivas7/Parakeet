import Link from 'next/link';
import MapaPublico from '@/components/mapa/MapaPublico';

export default async function Home({
  searchParams,
}: {
  // Next 16: searchParams es una Promise
  searchParams: Promise<{ zona?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const reporteEnviado = sp.ok === '1';

  return (
    // h-dvh = altura DEFINIDA (viewport). Necesaria para que el mapa (h-full)
    // resuelva su altura; con flex-1/min-h-full heredaria 0 y el heatmap
    // reventaria (getImageData sobre canvas de alto 0).
    <main className="flex h-dvh flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-bold">Parakeet</h1>
          <p className="text-xs text-neutral-500">
            Mapa de puntos contaminados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-neutral-500 underline">
            Ingresar
          </Link>
          <Link
            href="/reportar"
            className="min-h-11 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            + Reportar
          </Link>
        </div>
      </header>

      {reporteEnviado && (
        <div className="mx-4 mb-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          ¡Reporte recibido! Tu zona ya está marcada en el mapa.
        </div>
      )}

      <section className="relative min-h-0 flex-1">
        <MapaPublico focusZonaId={sp.zona} />
      </section>

      <footer className="px-4 py-3 text-center text-xs text-neutral-400">
        Turismo ecológico y sostenible · Reto EcoTrack
      </footer>
    </main>
  );
}
