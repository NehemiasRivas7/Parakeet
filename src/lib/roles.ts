import type { RolUsuario } from '@/lib/database.types';

// Client-safe: sin imports de servidor. Usado por auth.ts y por el login.
export const HOME_POR_ROL: Record<RolUsuario, string> = {
  estudiante: '/estudiante',
  organizacion: '/organizacion',
  empresa: '/empresa',
  admin: '/admin',
};

export const LABEL_ROL: Record<RolUsuario, string> = {
  estudiante: 'Voluntario',
  organizacion: 'Organización',
  empresa: 'Empresa',
  admin: 'Admin',
};
