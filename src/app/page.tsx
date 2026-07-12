import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import CarruselFases from '@/components/landing/CarruselFases';
import Contadores, { type Metrica } from '@/components/landing/Contadores';
import PericoVolando from '@/components/landing/PericoVolando';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Parakeet — Impacto ambiental medible, trazable y visible',
};

const FASES = [
  { titulo: 'Reportás', texto: 'Cualquiera marca un punto contaminado. Sin cuenta, en tres toques.' },
  { titulo: 'La comunidad propone', texto: 'Una organización crea una jornada desde esa zona crítica.' },
  { titulo: 'La empresa financia', texto: 'Con su presupuesto de RSE cubre la iniciativa.' },
  { titulo: 'Los voluntarios actúan', texto: 'Se inscriben, ejecutan y cumplen sus horas sociales.' },
  { titulo: 'La zona se recupera', texto: 'El mapa baja de nivel en vivo: el impacto se ve.' },
];

const ICONOS: Record<string, React.ReactNode> = {
  ciudadano: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-3.6 3.4-5.5 7.5-5.5s7.5 1.9 7.5 5.5" />
    </>
  ),
  estudiante: (
    <>
      <path d="M3 9l9-4 9 4-9 4-9-4z" />
      <path d="M7 11.5V16c0 1.1 2.2 2 5 2s5-.9 5-2v-4.5" />
    </>
  ),
  organizacion: (
    <>
      <path d="M12 21v-9" />
      <path d="M12 12c0-4 3-7 8-7 0 5-3 7-8 7z" />
      <path d="M12 14.5c0-3-2.2-5-6-5 0 4 3 5 6 5z" />
    </>
  ),
  empresa: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <path d="M9 8h2M13 8h2M9 12h2M13 12h2M10 20v-3h4v3" />
    </>
  ),
};

const ROLES = [
  {
    id: 'ciudadano',
    titulo: 'Ciudadano',
    texto: 'Reportá puntos contaminados sin registrarte. Tu reporte enciende todo el ciclo.',
    cta: 'Reportar ahora',
    href: '/reportar',
    real: true,
  },
  {
    id: 'estudiante',
    titulo: 'Voluntario',
    texto: 'Unite y sumá: inscribite a jornadas, impactá en el ambiente y el turismo, y cumplí tus horas con constancia verificable.',
    cta: 'Unite ahora',
    href: '/registro',
    real: true,
  },
  {
    id: 'organizacion',
    titulo: 'Organización',
    texto: 'Proponé jornadas desde zonas críticas, capacitá, tomá asistencia y cuantificá el impacto.',
    cta: 'Ingresar',
    href: '/login',
    real: false,
  },
  {
    id: 'empresa',
    titulo: 'Empresa (RSE)',
    texto: 'Financiá iniciativas y recibí un reporte de impacto con el antes y después de cada zona.',
    cta: 'Ingresar',
    href: '/login',
    real: false,
  },
];

const CHIPS = [
  'Reportes abiertos',
  'Impacto en el mapa',
  'Horas verificables',
  'RSE con evidencia',
];

function OndaDivisor() {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className="block h-9 w-full"
      aria-hidden
    >
      <path
        d="M0,40 C240,80 480,0 720,32 C960,64 1200,16 1440,48 L1440,80 L0,80 Z"
        fill="currentColor"
      />
    </svg>
  );
}

async function traerMetricas(): Promise<Metrica[]> {
  const admin = createAdminClient();
  const [rReportes, rZonas, rVol, rHoras, rResultados] = await Promise.all([
    admin.from('reportes').select('*', { count: 'exact', head: true }),
    admin.from('zonas').select('*', { count: 'exact', head: true }),
    admin.from('estudiantes').select('*', { count: 'exact', head: true }),
    admin.from('estudiantes').select('horas_acumuladas'),
    admin.from('resultados_jornada').select('valor, unidad'),
  ]);

  const horas = (rHoras.data ?? []).reduce(
    (s, r) => s + (r.horas_acumuladas ?? 0),
    0,
  );
  const kg = (rResultados.data ?? [])
    .filter((r) => /kg|kilo/i.test(r.unidad ?? ''))
    .reduce((s, r) => s + (r.valor ?? 0), 0);

  return [
    { valor: rReportes.count ?? 0, etiqueta: 'Reportes ciudadanos' },
    { valor: rZonas.count ?? 0, etiqueta: 'Zonas monitoreadas' },
    { valor: rVol.count ?? 0, etiqueta: 'Voluntarios' },
    horas > 0
      ? { valor: horas, etiqueta: 'Horas de impacto' }
      : { valor: Math.round(kg), etiqueta: 'Kg recolectados' },
  ];
}

export default async function Home() {
  const metricas = await traerMetricas();

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex flex-1 flex-col overflow-x-hidden">
        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative px-5 pb-12 pt-12 text-center">
          <div
            aria-hidden
            className="pk-flotar pointer-events-none absolute -left-16 top-8 h-56 w-56 rounded-full bg-brand-soft/50 blur-3xl"
          />
          <div
            aria-hidden
            className="pk-flotar-lento pointer-events-none absolute -right-12 top-32 h-48 w-48 rounded-full bg-accent-soft/40 blur-3xl"
          />
          {/* Perico verde que cruza al entrar */}
          <PericoVolando className="pk-volar pointer-events-none absolute left-0 top-3 z-20 h-9 w-14 drop-shadow" />

          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto mb-6 w-fit rounded-3xl bg-white p-2 shadow-[0_14px_28px_-12px_rgba(0,99,65,0.4)] ring-4 ring-brand-tint">
              <Logo className="h-16 w-16 rounded-2xl" />
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-mid">
              Turismo ecológico y sostenible
            </p>
            <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold leading-[1.1] text-brand-dark sm:text-[2.7rem]">
              Convertí un punto contaminado en{' '}
              <span className="relative whitespace-nowrap text-brand">
                horas de impacto
                <svg
                  viewBox="0 0 200 12"
                  className="absolute -bottom-1 left-0 h-2 w-full text-accent"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M2,8 C50,2 150,2 198,7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-ink/75">
              Parakeet conecta a la comunidad que <strong>reporta</strong>, las
              empresas que <strong>financian</strong> y los voluntarios que{' '}
              <strong>actúan</strong> — dejando impacto medible, trazable y
              visible en el mapa.
            </p>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/reportar"
                className="pk-btn pk-btn-accent min-h-12 w-full px-6 text-base sm:w-auto"
              >
                Reportar un punto
              </Link>
              <Link
                href="/mapa"
                className="pk-btn pk-btn-outline min-h-12 w-full px-6 text-base sm:w-auto"
              >
                Ver el mapa
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted">
              Sin registro · en menos de tres toques
            </p>
          </div>
        </section>

        {/* ── MÉTRICAS ─────────────────────────────────────────────── */}
        <section className="pk-subir mx-auto w-full max-w-3xl px-5 pb-8">
          <Contadores metricas={metricas} />
          <p className="mt-3 text-center text-xs text-muted">
            Impacto de la zona piloto, en vivo.
          </p>
        </section>

        {/* ── CÓMO FUNCIONA (carrusel) ─────────────────────────────── */}
        <section className="mx-auto w-full max-w-3xl px-5 py-8">
          <h2 className="text-center text-2xl font-bold text-brand-dark">
            Cómo funciona
          </h2>
          <p className="mx-auto mb-6 mt-2 max-w-xl text-center text-sm text-muted">
            De un reporte ciudadano a una zona recuperada, en cinco pasos.
          </p>
          <CarruselFases fases={FASES} />
        </section>

        {/* ── ROLES ────────────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-4xl px-5 py-8">
          <h2 className="text-center text-2xl font-bold text-brand-dark">
            Un ecosistema, cuatro actores
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted">
            Cada quien aporta lo suyo. Parakeet los conecta.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ROLES.map((r) => (
              <div key={r.id} className="pk-card flex flex-col p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-tint text-brand">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {ICONOS[r.id]}
                    </svg>
                  </span>
                  <h3 className="text-lg font-bold text-brand-dark">{r.titulo}</h3>
                </div>
                <p className="mt-3 flex-1 text-sm text-ink/75">{r.texto}</p>
                <Link
                  href={r.href}
                  className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${
                    r.real ? 'text-brand' : 'text-brand-mid'
                  }`}
                >
                  {r.cta} <span aria-hidden>→</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROPÓSITO (WHY) ──────────────────────────────────────── */}
        <div className="text-brand-dark">
          <OndaDivisor />
        </div>
        <section className="bg-brand-dark px-5 py-14 text-center text-white">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Nuestro propósito</h2>
            <p className="mt-4 text-base text-white/85">
              La contaminación golpea los destinos turísticos, a las comunidades y
              a la experiencia de quien visita. Creemos que el impacto de cada
              acción debe poder <strong className="text-white">verse</strong>. Por
              eso Parakeet hace visibles los puntos críticos, mide cada jornada y
              muestra —en el mapa, en vivo— cómo una zona pasa de crítica a
              recuperada.
            </p>
            <p className="mt-4 text-sm text-white/70">
              Horas sociales que sí dejan huella. Inversión de RSE que se puede
              demostrar. Comunidades que recuperan su lugar.
            </p>
          </div>
        </section>
        <div className="rotate-180 text-brand-dark">
          <OndaDivisor />
        </div>

        {/* ── NOSOTROS ─────────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-3xl px-5 py-12 text-center">
          <h2 className="text-2xl font-bold text-brand-dark">Nosotros</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink/75">
            Parakeet nació en el <strong>Hackathon de Turismo Creativo</strong>{' '}
            para el reto <strong>EcoTrack</strong>: turismo ecológico y
            sostenible. Somos un equipo que cree en soluciones simples y
            accionables, donde el impacto de cada persona es tangible y quedan
            datos que se pueden abrir y compartir.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
            {CHIPS.map((t) => (
              <span
                key={t}
                className="rounded-full bg-brand-tint px-3.5 py-1.5 font-medium text-brand-dark"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ── CTA prominente ───────────────────────────────────────── */}
        <section className="mt-auto bg-brand-tint px-5 py-12 text-center">
          <h2 className="text-2xl font-bold text-brand-dark">
            ¿Listo para sumar?
          </h2>
          <p className="mt-1 text-sm text-muted">Elegí por dónde empezar.</p>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3">
            <Link
              href="/reportar"
              className="pk-btn pk-btn-accent min-h-12 text-base"
            >
              Reportar
            </Link>
            <Link
              href="/registro"
              className="pk-btn pk-btn-primary min-h-12 text-base"
            >
              Soy voluntario
            </Link>
            <Link
              href="/mapa"
              className="pk-btn pk-btn-outline min-h-12 text-base"
            >
              Ver el mapa
            </Link>
            <Link
              href="/login"
              className="pk-btn pk-btn-outline min-h-12 text-base"
            >
              Ingresar
            </Link>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer className="border-t border-brand-soft/70 bg-white/50 px-5 py-8">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2.5">
              <Logo className="h-10 w-10 rounded-xl" />
              <div>
                <div className="font-bold text-brand-dark">Parakeet</div>
                <div className="text-xs text-muted">
                  Impacto ambiental medible y visible
                </div>
              </div>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
              <Link href="/reportar" className="hover:text-brand-dark">
                Reportar
              </Link>
              <Link href="/mapa" className="hover:text-brand-dark">
                Mapa
              </Link>
              <Link href="/registro" className="hover:text-brand-dark">
                Soy voluntario
              </Link>
              <Link href="/login" className="hover:text-brand-dark">
                Ingresar
              </Link>
            </nav>
          </div>
          <p className="mx-auto mt-6 max-w-5xl text-center text-xs text-muted sm:text-left">
            © 2026 Parakeet · Reto EcoTrack · Turismo ecológico y sostenible
          </p>
        </footer>
      </main>
    </div>
  );
}
