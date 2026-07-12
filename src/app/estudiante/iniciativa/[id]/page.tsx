import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstudiante } from '@/lib/auth';
import { inscribirse } from '@/lib/iniciativas/acciones';
import EncabezadoRol from '@/components/ui/EncabezadoRol';

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
      'id, nombre, descripcion, tipo_causa, fecha_jornada, lat, lng, cupo_max, horas_otorgadas, estado, organizaciones(nombre, verificada), financiamientos(empresas(nombre))',
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
    <main className="flex flex-1 flex-col">
      <EncabezadoRol titulo="Detalle" subtitulo={ini.nombre} />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3 px-4 py-4">
        <Link href="/estudiante" className="text-sm text-neutral-500 underline">
          ← Catálogo
        </Link>

        {msg && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              msg.ok
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
                : 'bg-red-50 text-red-700 dark:bg-red-950/50'
            }`}
          >
            {msg.texto}
          </p>
        )}

        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold leading-tight">{ini.nombre}</h2>
          {org?.verificada && (
            <span
              title="Sello Parakeet: la organización fue verificada y la jornada otorga horas sociales válidas."
              className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
            >
              ✓ Verificada
            </span>
          )}
        </div>

        <p className="text-sm text-neutral-500">
          {org?.nombre}
          {empresa?.nombre ? ` · patrocina ${empresa.nombre}` : ''}
        </p>

        <p className="text-sm">{ini.descripcion}</p>

        <dl className="grid grid-cols-2 gap-2 rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <div>📅 {ini.fecha_jornada}</div>
          <div>⏱️ {ini.horas_otorgadas} h sociales</div>
          <div>🎯 {ini.tipo_causa}</div>
          <div>
            👥 {cuposRestantes > 0 ? `${cuposRestantes} cupos` : 'Lleno'}
          </div>
        </dl>

        <div className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <div className="font-semibold">Punto de encuentro</div>
          <div className="text-neutral-500">
            {ini.lat.toFixed(5)}, {ini.lng.toFixed(5)}
          </div>
          <a
            href={`https://www.openstreetmap.org/?mlat=${ini.lat}&mlon=${ini.lng}#map=17/${ini.lat}/${ini.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 underline dark:text-emerald-400"
          >
            Ver en el mapa →
          </a>
        </div>

        {/* Acción de inscripción */}
        <div className="mt-2">
          {yaInscrito ? (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
              ✓ Ya estás inscrito
            </div>
          ) : !abierta ? (
            <div className="rounded-xl bg-neutral-100 px-4 py-3 text-center text-sm text-neutral-500 dark:bg-neutral-900">
              La inscripción no está abierta.
            </div>
          ) : cuposRestantes === 0 ? (
            <div className="rounded-xl bg-neutral-100 px-4 py-3 text-center text-sm text-neutral-500 dark:bg-neutral-900">
              Cupo lleno.
            </div>
          ) : (
            <form action={inscribirse}>
              <input type="hidden" name="id" value={ini.id} />
              <button className="min-h-12 w-full rounded-xl bg-emerald-600 px-4 font-semibold text-white">
                Inscribirme
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
