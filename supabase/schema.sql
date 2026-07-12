-- Parakeet — Plan 1.1 · Esquema base
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- Orden: schema.sql -> functions.sql -> rls.sql -> seed.sql

create type rol_usuario as enum ('estudiante','organizacion','empresa','admin');
create type nivel_gravedad as enum ('recuperada','bajo','medio','alto','critico');
create type estado_iniciativa as enum (
  'borrador','en_revision','financiable','financiada',
  'inscripcion_abierta','en_curso','completada','cancelada'
);
create type tipo_contaminacion as enum ('basura','plastico','aguas_negras','escombros','otro');

create table usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  rol rol_usuario not null,
  nombre text not null,
  creado_en timestamptz default now()
);

create table estudiantes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid unique not null references usuarios(id) on delete cascade,
  institucion text not null,
  horas_requeridas int not null default 100,
  horas_acumuladas int not null default 0
);

create table organizaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid unique not null references usuarios(id) on delete cascade,
  nombre text not null,
  zona_cobertura text,
  verificada boolean not null default false
);

create table empresas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid unique not null references usuarios(id) on delete cascade,
  nombre text not null,
  logo_url text,
  verificada boolean not null default false
);

create table zonas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  lat_centro double precision not null,
  lng_centro double precision not null,
  radio_m int not null default 300,
  nivel_gravedad nivel_gravedad not null default 'bajo',
  nivel_inicial nivel_gravedad not null default 'bajo',
  total_reportes int not null default 0,
  actualizada_en timestamptz default now()
);

create table reportes (
  id uuid primary key default gen_random_uuid(),
  zona_id uuid references zonas(id) on delete set null,
  lat double precision not null,
  lng double precision not null,
  tipo_contaminacion tipo_contaminacion not null,
  descripcion text,
  foto_url text,
  creado_en timestamptz default now()
);

create table iniciativas (
  id uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references organizaciones(id) on delete cascade,
  zona_id uuid references zonas(id) on delete set null,
  nombre text not null,
  descripcion text not null,
  tipo_causa text not null,
  lat double precision not null,
  lng double precision not null,
  fecha_jornada date not null,
  cupo_max int not null,
  horas_otorgadas int not null,
  monto_requerido numeric(10,2) not null,
  estado estado_iniciativa not null default 'borrador',
  motivo_cancelacion text,
  creada_en timestamptz default now()
);

create table financiamientos (
  id uuid primary key default gen_random_uuid(),
  iniciativa_id uuid unique not null references iniciativas(id) on delete cascade,
  empresa_id uuid not null references empresas(id),
  monto numeric(10,2) not null,
  estado_pago text not null default 'simulado',
  confirmado_en timestamptz default now()
);

create table inscripciones (
  id uuid primary key default gen_random_uuid(),
  iniciativa_id uuid not null references iniciativas(id) on delete cascade,
  estudiante_id uuid not null references estudiantes(id) on delete cascade,
  inscrito_en timestamptz default now(),
  unique (iniciativa_id, estudiante_id)
);

create table asistencias (
  id uuid primary key default gen_random_uuid(),
  inscripcion_id uuid unique not null references inscripciones(id) on delete cascade,
  asistio boolean not null,
  horas_acreditadas int not null default 0,
  marcada_en timestamptz default now()
);

create table resultados_jornada (
  id uuid primary key default gen_random_uuid(),
  iniciativa_id uuid not null references iniciativas(id) on delete cascade,
  metrica text not null,
  valor double precision not null,
  unidad text not null,
  registrado_en timestamptz default now()
);

create table stamps (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references estudiantes(id) on delete cascade,
  iniciativa_id uuid not null references iniciativas(id) on delete cascade,
  tipo text not null,
  otorgado_en timestamptz default now(),
  unique (estudiante_id, iniciativa_id)
);
