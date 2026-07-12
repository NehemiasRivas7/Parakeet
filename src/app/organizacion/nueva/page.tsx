import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireOrganizacion } from '@/lib/auth';
import { crearIniciativa } from '@/lib/iniciativas/acciones';
import EncabezadoRol from '@/components/ui/EncabezadoRol';

export const dynamic = 'force-dynamic';

export default async function NuevaIniciativaPage({
  searchParams,
}: {
  searchParams: Promise<{ zona?: string; error?: string }>;
}) {
  await requireOrganizacion();
  const sp = await searchParams;

  // Precargar ubicacion/nombre si viene de una zona del mapa.
  let zona: {
    id: string;
    nombre: string;
    lat_centro: number;
    lng_centro: number;
  } | null = null;
  if (sp.zona) {
    const admin = createAdminClient();
    const { data } = await admin
      .from('zonas')
      .select('id, nombre, lat_centro, lng_centro')
      .eq('id', sp.zona)
      .single();
    zona = data;
  }

  const inputCls =
    'min-h-11 w-full rounded-xl border border-neutral-300 bg-transparent px-3 dark:border-neutral-600';

  return (
    <main className="flex flex-1 flex-col">
      <EncabezadoRol titulo="Nueva iniciativa" subtitulo="Guardá y enviá a revisión" />

      <form
        action={crearIniciativa}
        className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3 px-4 py-4"
      >
        {sp.error === 'campos' && (
          <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950/50">
            Revisá los campos: todos son obligatorios y los números deben ser
            válidos.
          </p>
        )}

        {zona && (
          <p className="rounded-lg bg-sky-50 p-2 text-sm text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
            Zona: <strong>{zona.nombre}</strong> — ubicación heredada.
          </p>
        )}

        <input type="hidden" name="zona_id" value={zona?.id ?? ''} />
        <input type="hidden" name="lat" value={zona?.lat_centro ?? 13.4936} />
        <input type="hidden" name="lng" value={zona?.lng_centro ?? -89.3823} />

        <label className="text-sm font-semibold">Nombre</label>
        <input
          name="nombre"
          required
          placeholder="Ej. Limpieza de playa El Tunco"
          defaultValue={zona ? `Limpieza de ${zona.nombre}` : ''}
          className={inputCls}
        />

        <label className="text-sm font-semibold">Descripción</label>
        <textarea
          name="descripcion"
          required
          rows={3}
          placeholder="¿Qué se hará en la jornada?"
          className="w-full rounded-xl border border-neutral-300 bg-transparent p-3 dark:border-neutral-600"
        />

        <label className="text-sm font-semibold">Tipo de causa</label>
        <input
          name="tipo_causa"
          required
          placeholder="Ej. Limpieza costera"
          className={inputCls}
        />

        <label className="text-sm font-semibold">Fecha de la jornada</label>
        <input name="fecha_jornada" type="date" required className={inputCls} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold">Cupo</label>
            <input
              name="cupo_max"
              type="number"
              min={1}
              required
              placeholder="20"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Horas sociales</label>
            <input
              name="horas_otorgadas"
              type="number"
              min={1}
              required
              placeholder="8"
              className={inputCls}
            />
          </div>
        </div>

        <label className="text-sm font-semibold">Monto requerido (USD)</label>
        <input
          name="monto_requerido"
          type="number"
          min={0}
          step="0.01"
          required
          placeholder="500.00"
          className={inputCls}
        />

        <div className="mt-2 flex gap-2">
          <Link
            href="/organizacion"
            className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-neutral-300 text-sm font-semibold dark:border-neutral-600"
          >
            Cancelar
          </Link>
          <button className="min-h-12 flex-1 rounded-xl bg-emerald-600 px-4 font-semibold text-white">
            Guardar borrador
          </button>
        </div>
      </form>
    </main>
  );
}
