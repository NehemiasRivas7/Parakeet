import { requireEstudiante } from '@/lib/auth';
import EncabezadoVoluntario from '@/components/ui/EncabezadoVoluntario';
import EstudianteNav from '@/components/ui/EstudianteNav';

export const dynamic = 'force-dynamic';

export default async function EstudianteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario } = await requireEstudiante();

  return (
    <div className="flex h-dvh flex-col">
      <EncabezadoVoluntario nombre={usuario.nombre} />
      <EstudianteNav />
      {children}
    </div>
  );
}
