import { requireOrganizacion } from '@/lib/auth';
import EncabezadoRol from '@/components/ui/EncabezadoRol';
import OrganizacionNav from '@/components/ui/OrganizacionNav';

export const dynamic = 'force-dynamic';

export default async function OrganizacionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { org } = await requireOrganizacion();

  return (
    <div className="flex h-dvh flex-col">
      <EncabezadoRol titulo={org.nombre} subtitulo="Panel de organización" />
      <OrganizacionNav />
      {children}
    </div>
  );
}
