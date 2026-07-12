import { requireOrganizacion } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import ClimaVista from '@/components/clima/ClimaVista';

export const dynamic = 'force-dynamic';

export default async function ClimaPage() {
  const { org } = await requireOrganizacion();
  const admin = createAdminClient();

  const [{ data: zonas }, { data: inis }] = await Promise.all([
    admin.from('zonas').select('id, nombre, lat_centro, lng_centro'),
    admin
      .from('iniciativas')
      .select('fecha_jornada')
      .eq('organizacion_id', org.id)
      .in('estado', ['financiada', 'inscripcion_abierta', 'en_curso']),
  ]);

  const zonasMap = (zonas ?? []).map((z) => ({
    id: z.id,
    nombre: z.nombre,
    lat: z.lat_centro,
    lng: z.lng_centro,
  }));

  const fechasJornadas = Array.from(
    new Set((inis ?? []).map((i) => i.fecha_jornada)),
  ).sort();

  const fechaHoy = new Date().toISOString().slice(0, 10);

  return (
    <ClimaVista
      zonas={zonasMap}
      fechasJornadas={fechasJornadas}
      fechaHoy={fechaHoy}
    />
  );
}
