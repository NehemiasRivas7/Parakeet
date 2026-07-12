-- Parakeet — Plan 1.4 · Seed de la zona piloto (Playa El Tunco)
--
-- DESVIACION DEL PLAN (justificada): el plan insertaba la zona con
-- total_reportes = 6 y ademas 6 reportes, lo que hace que el trigger cuente
-- doble. Ademas el "momento wow" documentado (flujo paso 9) es CRITICO -> MEDIO,
-- y 6 reportes solo llegan a 'alto'. Aqui la zona arranca en 0 y 10 reportes
-- reales disparan el trigger hasta 'critico', de modo que:
--   * el trigger queda probado (Gate 1) al correr este seed,
--   * el cierre de jornada (Plan 5) baja critico -> medio de forma garantizada,
--     sin depender de que el jurado reporte en vivo.
-- El reporte en vivo del Gate 2 igual intensifica el heatmap (mas puntos).

begin;

-- Zona piloto. total_reportes arranca en 0 (default); el trigger lo sube.
-- nivel_inicial = 'critico' guarda el pico para el antes/despues del mapa.
insert into zonas (id, nombre, lat_centro, lng_centro, radio_m, nivel_inicial)
values ('11111111-1111-1111-1111-111111111111', 'Playa El Tunco',
        13.4936, -89.3823, 300, 'critico');

-- 10 reportes dispersos +-0.002 alrededor del centro. Predomina 'plastico'.
-- Cada insert dispara trg_gravedad -> total_reportes 1..10, nivel -> 'critico'.
insert into reportes (zona_id, lat, lng, tipo_contaminacion, descripcion) values
  ('11111111-1111-1111-1111-111111111111', 13.4940, -89.3818, 'plastico',     'Botellas plasticas en la orilla'),
  ('11111111-1111-1111-1111-111111111111', 13.4931, -89.3829, 'basura',       'Bolsas y desechos junto a las rocas'),
  ('11111111-1111-1111-1111-111111111111', 13.4948, -89.3831, 'plastico',     'Restos de pajillas y vasos'),
  ('11111111-1111-1111-1111-111111111111', 13.4925, -89.3815, 'aguas_negras', 'Descarga turbia cerca del estero'),
  ('11111111-1111-1111-1111-111111111111', 13.4952, -89.3820, 'basura',       'Latas y colillas en la arena'),
  ('11111111-1111-1111-1111-111111111111', 13.4938, -89.3840, 'plastico',     'Microplasticos acumulados'),
  ('11111111-1111-1111-1111-111111111111', 13.4920, -89.3825, 'escombros',    'Escombros de construccion'),
  ('11111111-1111-1111-1111-111111111111', 13.4945, -89.3810, 'basura',       'Restos organicos y empaques'),
  ('11111111-1111-1111-1111-111111111111', 13.4933, -89.3835, 'plastico',     'Redes y plastico enredado'),
  ('11111111-1111-1111-1111-111111111111', 13.4950, -89.3828, 'otro',         'Aceite / mancha en la superficie');

commit;

-- Verificacion rapida (Gate 1): debe mostrar total_reportes = 10, nivel = 'critico'
-- select nombre, total_reportes, nivel_gravedad, nivel_inicial from zonas;
