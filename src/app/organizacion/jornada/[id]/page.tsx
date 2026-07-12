import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireOrganizacion } from '@/lib/auth';
import FormJornada from '@/components/iniciativa/FormJornada';
import TarjetaAntesDespues from '@/components/impacto/TarjetaAntesDespues';
import MetricasImpacto from '@/components/impacto/MetricasImpacto';
import type { NivelGravedad } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

function unwrap<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

export default async function JornadaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cerrada?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { org } = await requireOrganizacion();
  const admin = createAdminClient();

  const { data: ini } = await admin
    .from('iniciativas')
    .select(
      'id, organizacion_id, nombre, estado, fecha_jornada, zonas(nombre, nivel_inicial, nivel_gravedad)',
    )
    .eq('id', id)
    .single();

  if (!ini) notFound();
  if (ini.organizacion_id !== org.id) redirect('/organizacion');

  const zona = unwrap(
    ini.zonas as
      | { nombre: string; nivel_inicial: NivelGravedad; nivel_gravedad: NivelGravedad }
      | { nombre: string; nivel_inicial: NivelGravedad; nivel_gravedad: NivelGravedad }[]
      | null,
  );

  // ── Jornada completada: mostrar impacto ──────────────────────────────────
  if (ini.estado === 'completada') {
    const [{ data: resultados }, { count: asistieron }] = await Promise.all([
      admin
        .from('resultados_jornada')
        .select('metrica, valor, unidad')
        .eq('iniciativa_id', id),
      admin
        .from('asistencias')
        .select('*, inscripciones!inner(iniciativa_id)', {
          count: 'exact',
          head: true,
        })
        .eq('inscripciones.iniciativa_id', id)
        .eq('asistio', true),
    ]);

    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-md px-4 py-4">
          <Link href="/organizacion" className="text-sm font-medium text-brand-mid">
            ← Panel
          </Link>
          {sp.cerrada === '1' && (
            <div className="mt-2 rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(16,148,45,0.6)]">
              ¡Jornada cerrada! Horas y sellos acreditados — la zona bajó de
              nivel en el mapa.
            </div>
          )}
          <h2 className="mb-1 mt-2 text-lg font-bold text-brand-dark">
            {ini.nombre}
          </h2>
          <p className="mb-4 text-sm text-muted">
            Jornada completada · {asistieron ?? 0} voluntarios asistieron
          </p>

          {zona && (
            <div className="mb-4">
              <TarjetaAntesDespues
                nivelInicial={zona.nivel_inicial}
                nivelActual={zona.nivel_gravedad}
              />
            </div>
          )}

          <h3 className="mb-2 font-semibold text-brand-dark">
            Impacto cuantificado
          </h3>
          <MetricasImpacto metricas={resultados ?? []} />
          {(resultados ?? []).length === 0 && (
            <p className="text-sm text-muted">
              No se registraron métricas en esta jornada.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Jornada abierta / en curso: gestionar cierre ─────────────────────────
  if (!['inscripcion_abierta', 'en_curso'].includes(ini.estado)) {
    redirect('/organizacion');
  }

  const { data: insc } = await admin
    .from('inscripciones')
    .select('id, estudiantes(institucion, usuarios(nombre))')
    .eq('iniciativa_id', id);

  const inscritos = (insc ?? []).map((i) => {
    const est = unwrap(
      i.estudiantes as
        | { institucion: string; usuarios: { nombre: string } | { nombre: string }[] | null }
        | { institucion: string; usuarios: { nombre: string } | { nombre: string }[] | null }[]
        | null,
    );
    const usuario = est ? unwrap(est.usuarios) : null;
    return {
      inscripcionId: i.id,
      nombre: usuario?.nombre ?? 'Voluntario',
      institucion: est?.institucion ?? '',
    };
  });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-4 pt-4">
        <Link href="/organizacion" className="text-sm font-medium text-brand-mid">
          ← Panel
        </Link>
        <h2 className="mb-1 mt-2 text-lg font-bold text-brand-dark">
          {ini.nombre}
        </h2>
        <p className="text-sm text-muted">Cierre de jornada · {ini.fecha_jornada}</p>
      </div>
      <FormJornada iniciativaId={ini.id} inscritos={inscritos} />
    </div>
  );
}
