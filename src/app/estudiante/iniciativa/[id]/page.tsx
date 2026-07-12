import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstudiante } from '@/lib/auth';
import { inscribirse } from '@/lib/iniciativas/acciones';

export const dynamic = 'force-dynamic';

const MENSAJE: Record<string, { texto: string; ok: boolean }> = {
  ok: { texto: '¡Inscripción confirmada! Ya aparece en tus iniciativas.', ok: true },
  duplicado: { texto: 'Ya estabas inscrito en esta iniciativa.', ok: true },
  lleno: { texto: 'El cupo se llenó. No pudimos inscribirte.', ok: false },
  cerrada: { texto: 'La inscripción a esta iniciativa ya no está abierta.', ok: false },
};

export default async function DetalleIniciativaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ estado?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { estudiante } = await requireEstudiante();
  const admin = createAdminClient();

  const { data: ini } = await admin
    .from('iniciativas')
    .select(
      'id, nombre, descripcion, tipo_causa, fecha_jornada, lat, lng, cupo_max, horas_otorgadas, estado, organizaciones(nombre, verificada), financiamientos(empresas(nombre)), zonas(nombre)',
    )
    .eq('id', id)
    .single();

  if (!ini) notFound();

  const org = Array.isArray(ini.organizaciones)
    ? ini.organizaciones[0]
    : (ini.organizaciones as { nombre: string; verificada: boolean } | null);
  const fin = Array.isArray(ini.financiamientos)
    ? ini.financiamientos[0]
    : (ini.financiamientos as { empresas: { nombre: string } | null } | null);
  const empresa = fin
    ? Array.isArray(fin.empresas)
      ? fin.empresas[0]
      : fin.empresas
    : null;
  const zonaRel = ini.zonas;
  const zonaNombre = Array.isArray(zonaRel)
    ? zonaRel[0]?.nombre
    : (zonaRel as { nombre: string } | null)?.nombre;

  const [{ count: inscritos }, { data: miInscripcion }] = await Promise.all([
    admin
      .from('inscripciones')
      .select('*', { count: 'exact', head: true })
      .eq('iniciativa_id', id),
    admin
      .from('inscripciones')
      .select('id')
      .eq('iniciativa_id', id)
      .eq('estudiante_id', estudiante.id)
      .maybeSingle(),
  ]);

  const cuposRestantes = Math.max(0, ini.cupo_max - (inscritos ?? 0));
  const yaInscrito = !!miInscripcion;
  const abierta = ini.estado === 'inscripcion_abierta';
  const msg = sp.estado ? MENSAJE[sp.estado] : null;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-4 py-4">
        <Link href="/estudiante" className="text-sm font-medium text-brand-mid">
          ← Catálogo
        </Link>

        {msg && (
          <p
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              msg.ok
                ? 'bg-brand-tint text-brand-dark'
                : 'bg-accent-soft/60 text-accent'
            }`}
          >
            {msg.texto}
          </p>
        )}

        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold leading-tight text-brand-dark">
            {ini.nombre}
          </h2>
          {org?.verificada && (
            <span
              title="Sello Parakeet: la organización fue verificada y la jornada otorga horas sociales válidas."
              className="shrink-0 rounded-full bg-brand-tint px-2 py-0.5 text-xs font-semibold text-brand-dark"
            >
              ✓ Verificada
            </span>
          )}
        </div>

        <p className="text-sm text-muted">
          {org?.nombre}
          {empresa?.nombre ? ` · patrocina ${empresa.nombre}` : ''}
        </p>

        <p className="text-sm text-ink">{ini.descripcion}</p>

        <dl className="pk-card grid grid-cols-2 gap-2 p-4 text-sm text-ink">
          <div>📅 {ini.fecha_jornada}</div>
          <div>⏱️ {ini.horas_otorgadas} h sociales</div>
          <div>🎯 {ini.tipo_causa}</div>
          <div>👥 {cuposRestantes > 0 ? `${cuposRestantes} cupos` : 'Lleno'}</div>
        </dl>

        <div className="pk-card p-4 text-sm">
          <div className="font-semibold text-brand-dark">Punto de encuentro</div>
          <div className="text-ink">📍 {zonaNombre ?? 'Zona de la jornada'}</div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${ini.lat},${ini.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block font-medium text-brand-mid hover:text-brand-dark"
          >
            Cómo llegar →
          </a>
        </div>

        <div className="mt-2">
          {yaInscrito ? (
            <div className="rounded-xl bg-brand-tint px-4 py-3 text-center text-sm font-semibold text-brand-dark">
              ✓ Ya estás inscrito
            </div>
          ) : !abierta ? (
            <div className="rounded-xl bg-brand-tint/60 px-4 py-3 text-center text-sm text-muted">
              La inscripción no está abierta.
            </div>
          ) : cuposRestantes === 0 ? (
            <div className="rounded-xl bg-accent-soft/60 px-4 py-3 text-center text-sm font-medium text-accent">
              Cupo lleno.
            </div>
          ) : (
            <form action={inscribirse}>
              <input type="hidden" name="id" value={ini.id} />
              <button className="pk-btn pk-btn-primary min-h-12 w-full text-base">
                Inscribirme
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
