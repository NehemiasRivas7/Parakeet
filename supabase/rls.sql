-- Parakeet — Plan 1.3 · Row Level Security  (idempotente: se puede re-correr)
--
-- NOTA DE SEGURIDAD: el plan original solo activaba RLS en 5 tablas. La anon key
-- viaja al browser (NEXT_PUBLIC_*), asi que dejar las demas tablas sin RLS las
-- expone a lectura/escritura anonima de CUALQUIERA. Los RNF-4.2 y RNF-4.4 exigen
-- aislamiento por RLS (un estudiante no lee datos de otro; la empresa nunca ve
-- datos personales). Por eso aqui se activa RLS en TODAS las tablas.
--
-- Modelo de acceso:
--   * Lectura publica: datos de dominio no personales (zonas, reportes, iniciativas
--     visibles, orgs, empresas, resultados, stamps) para pintar mapa/catalogo.
--   * usuarios: cada quien solo lee su propia fila (protege el email).
--   * Escrituras sensibles: NO hay policy de insert/update para anon, asi que solo
--     el service_role (rutas /api server-side) puede escribirlas.
--   * Excepciones de escritura cliente: reportes (anonimo, por diseno del reto) e
--     inscripciones (requiere sesion).

-- ── Habilitar RLS en todas las tablas (re-correr es no-op) ─────────────────
alter table usuarios           enable row level security;
alter table estudiantes        enable row level security;
alter table organizaciones     enable row level security;
alter table empresas           enable row level security;
alter table zonas              enable row level security;
alter table reportes           enable row level security;
alter table iniciativas        enable row level security;
alter table financiamientos    enable row level security;
alter table inscripciones      enable row level security;
alter table asistencias        enable row level security;
alter table resultados_jornada enable row level security;
alter table stamps             enable row level security;

-- ── Lectura ────────────────────────────────────────────────────────────────
drop policy if exists "zonas lectura publica" on zonas;
create policy "zonas lectura publica" on zonas for select using (true);

drop policy if exists "reportes lectura publica" on reportes;
create policy "reportes lectura publica" on reportes for select using (true);

drop policy if exists "iniciativas segun estado" on iniciativas;
create policy "iniciativas segun estado" on iniciativas for select using (
  estado in ('financiable','financiada','inscripcion_abierta','en_curso','completada')
  or organizacion_id in (
    select o.id from organizaciones o
    join usuarios u on u.id = o.usuario_id
    where u.id = auth.uid()
  )
);

drop policy if exists "estudiante ve solo lo suyo" on estudiantes;
create policy "estudiante ve solo lo suyo" on estudiantes for select using (
  usuario_id = auth.uid()
);

drop policy if exists "usuario ve su propia fila" on usuarios;
create policy "usuario ve su propia fila" on usuarios for select using (
  id = auth.uid()
);

drop policy if exists "organizaciones lectura publica" on organizaciones;
create policy "organizaciones lectura publica" on organizaciones for select using (true);

drop policy if exists "empresas lectura publica" on empresas;
create policy "empresas lectura publica" on empresas for select using (true);

drop policy if exists "financiamientos lectura publica" on financiamientos;
create policy "financiamientos lectura publica" on financiamientos for select using (true);

drop policy if exists "asistencias lectura publica" on asistencias;
create policy "asistencias lectura publica" on asistencias for select using (true);

drop policy if exists "resultados lectura publica" on resultados_jornada;
create policy "resultados lectura publica" on resultados_jornada for select using (true);

drop policy if exists "stamps lectura publica" on stamps;
create policy "stamps lectura publica" on stamps for select using (true);

drop policy if exists "inscripciones lectura publica" on inscripciones;
create policy "inscripciones lectura publica" on inscripciones for select using (true);

-- ── Escritura desde el cliente ─────────────────────────────────────────────
-- reportes: anonimo por diseno del reto (RF-A01)
drop policy if exists "reportes insert anonimo" on reportes;
create policy "reportes insert anonimo" on reportes for insert with check (true);

-- inscripciones: solo con sesion iniciada
drop policy if exists "inscripciones insert con sesion" on inscripciones;
create policy "inscripciones insert con sesion" on inscripciones for insert with check (
  auth.uid() is not null
);
