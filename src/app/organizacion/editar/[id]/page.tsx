import { notFound, redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireOrganizacion } from '@/lib/auth';
import FormIniciativa from '@/components/iniciativa/FormIniciativa';

export const dynamic = 'force-dynamic';

export default async function EditarIniciativaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { org } = await requireOrganizacion();
  const admin = createAdminClient();

  const { data: ini } = await admin
    .from('iniciativas')
    .select(
      'id, organizacion_id, estado, nombre, descripcion, tipo_causa, fecha_jornada, lat, lng, zona_id, cupo_max, horas_otorgadas, monto_requerido, zonas(nombre)',
    )
    .eq('id', id)
    .single();

  if (!ini) notFound();
  if (ini.organizacion_id !== org.id) redirect('/organizacion');
  // Solo editable antes del financiamiento.
  if (!['borrador', 'financiable'].includes(ini.estado)) redirect('/organizacion');

  const zona = Array.isArray(ini.zonas)
    ? ini.zonas[0]
    : (ini.zonas as { nombre: string } | null);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <h2 className="mx-auto w-full max-w-md px-4 pt-4 text-lg font-bold">
        Editar iniciativa
      </h2>
      <FormIniciativa
        modo="editar"
        id={ini.id}
        initial={{
          lat: ini.lat,
          lng: ini.lng,
          zonaId: ini.zona_id,
          zonaNombre: zona?.nombre ?? null,
          nombre: ini.nombre,
          descripcion: ini.descripcion,
          tipo_causa: ini.tipo_causa,
          fecha_jornada: ini.fecha_jornada,
          cupo_max: String(ini.cupo_max),
          horas_otorgadas: String(ini.horas_otorgadas),
          monto_requerido: String(ini.monto_requerido),
        }}
        huboError={sp.error === 'campos'}
      />
    </div>
  );
}
