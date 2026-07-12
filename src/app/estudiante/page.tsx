import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstudiante } from '@/lib/auth';
import EncabezadoRol from '@/components/ui/EncabezadoRol';
import CatalogoEstudiante, {
  type IniciativaCatalogo,
} from '@/components/iniciativa/CatalogoEstudiante';

export const dynamic = 'force-dynamic';

export default async function EstudiantePage() {
  await requireEstudiante();
  const admin = createAdminClient();

  const { data: inis } = await admin
    .from('iniciativas')
    .select(
      'id, nombre, tipo_causa, fecha_jornada, horas_otorgadas, cupo_max, lat, lng, organizaciones(nombre, verificada), financiamientos(empresas(nombre)), zonas(nombre)',
    )
    .eq('estado', 'inscripcion_abierta')
    .order('fecha_jornada', { ascending: true });

  const lista = inis ?? [];

  // Conteo de inscripciones por iniciativa para calcular cupos restantes.
  const ids = lista.map((i) => i.id);
  const conteo: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: insc } = await admin
      .from('inscripciones')
      .select('iniciativa_id')
      .in('iniciativa_id', ids);
    for (const r of insc ?? []) {
      conteo[r.iniciativa_id] = (conteo[r.iniciativa_id] ?? 0) + 1;
    }
  }

  const iniciativas: IniciativaCatalogo[] = lista.map((i) => {
    const org = Array.isArray(i.organizaciones)
      ? i.organizaciones[0]
      : (i.organizaciones as { nombre: string; verificada: boolean } | null);
    const fin = Array.isArray(i.financiamientos)
      ? i.financiamientos[0]
      : (i.financiamientos as { empresas: { nombre: string } | null } | null);
    const empresa = fin
      ? Array.isArray(fin.empresas)
        ? fin.empresas[0]
        : fin.empresas
      : null;
    const zona = Array.isArray(i.zonas)
      ? i.zonas[0]
      : (i.zonas as { nombre: string } | null);
    return {
      id: i.id,
      nombre: i.nombre,
      lat: i.lat,
      lng: i.lng,
      categoria: i.tipo_causa,
      zona_nombre: zona?.nombre ?? null,
      fecha_jornada: i.fecha_jornada,
      horas_otorgadas: i.horas_otorgadas,
      cupos_restantes: Math.max(0, i.cupo_max - (conteo[i.id] ?? 0)),
      org_nombre: org?.nombre ?? 'Organización',
      org_verificada: org?.verificada ?? false,
      empresa_nombre: empresa?.nombre ?? null,
    };
  });

  return (
    <main className="flex h-dvh flex-col">
      <EncabezadoRol titulo="Iniciativas" subtitulo="Inscribite y cumplí tus horas" />
      <div className="mx-auto w-full max-w-md px-4 pt-3">
        <Link
          href="/estudiante/horas"
          className="mb-1 inline-block text-sm text-emerald-700 underline dark:text-emerald-400"
        >
          Ver mis horas y stamps →
        </Link>
      </div>
      <CatalogoEstudiante iniciativas={iniciativas} />
    </main>
  );
}
