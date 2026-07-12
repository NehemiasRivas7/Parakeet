// Categorias de causa mas conocidas (para el select al crear iniciativa).
// tipo_causa se guarda como texto libre: si el usuario elige "Otro", escribe la suya.
export const CATEGORIAS = [
  'Limpieza costera',
  'Reforestación',
  'Reciclaje',
  'Gestión de residuos',
  'Educación ambiental',
  'Conservación de fauna y flora',
  'Saneamiento de ríos',
] as const;

export const CATEGORIA_OTRO = 'Otro';
