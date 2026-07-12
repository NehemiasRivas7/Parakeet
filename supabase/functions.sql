-- Parakeet — Plan 1.2 · Trigger de gravedad de zona
-- Esta funcion es la que hace que el heatmap suba de intensidad solo.
-- Sin esto, no hay reto EcoTrack.
-- (El RPC transaccional cerrar_jornada se agrega en el Plan 5.)

create or replace function recalcular_gravedad_zona()
returns trigger language plpgsql as $$
declare n int;
begin
  update zonas set total_reportes = total_reportes + 1,
                   actualizada_en = now()
  where id = new.zona_id
  returning total_reportes into n;

  update zonas set nivel_gravedad = case
    when n >= 10 then 'critico'::nivel_gravedad
    when n >= 5  then 'alto'::nivel_gravedad
    when n >= 2  then 'medio'::nivel_gravedad
    else 'bajo'::nivel_gravedad
  end
  where id = new.zona_id;

  return new;
end $$;

drop trigger if exists trg_gravedad on reportes;
create trigger trg_gravedad
after insert on reportes
for each row when (new.zona_id is not null)
execute function recalcular_gravedad_zona();

-- Parakeet — Plan 5.3 · RPC transaccional de cierre de jornada.
-- TODO o NADA: acredita horas + stamp a quienes asistieron, guarda las métricas
-- cuantificadas, BAJA la gravedad de la zona (el momento wow) y marca completada.
-- security definer: corre con privilegios del dueño (salta RLS). Se restringe su
-- ejecución a service_role (lo llama el Server Action).
create or replace function cerrar_jornada(
  p_iniciativa uuid,
  p_asistieron uuid[],   -- inscripcion_id que asistieron
  p_metricas jsonb        -- [{"metrica":"...","valor":123,"unidad":"kg"}, ...]
)
returns void language plpgsql security definer as $$
declare
  h int;
  z uuid;
  st text;
begin
  select horas_otorgadas, zona_id, estado into h, z, st
  from iniciativas where id = p_iniciativa;

  -- Idempotencia: si ya está completada, no re-acreditar.
  if st = 'completada' then
    return;
  end if;

  -- Asistencia por inscrito (true a los marcados, false al resto).
  insert into asistencias (inscripcion_id, asistio, horas_acreditadas)
  select i.id,
         (i.id = any(p_asistieron)),
         case when i.id = any(p_asistieron) then h else 0 end
  from inscripciones i
  where i.iniciativa_id = p_iniciativa
  on conflict (inscripcion_id) do update
    set asistio = excluded.asistio,
        horas_acreditadas = excluded.horas_acreditadas,
        marcada_en = now();

  -- Acreditar horas solo a quienes asistieron.
  update estudiantes e
  set horas_acumuladas = horas_acumuladas + h
  where e.id in (
    select i.estudiante_id from inscripciones i
    where i.iniciativa_id = p_iniciativa and i.id = any(p_asistieron)
  );

  -- Stamp (green passport) a quienes asistieron.
  insert into stamps (estudiante_id, iniciativa_id, tipo)
  select i.estudiante_id, p_iniciativa, 'jornada'
  from inscripciones i
  where i.iniciativa_id = p_iniciativa and i.id = any(p_asistieron)
  on conflict (estudiante_id, iniciativa_id) do nothing;

  -- Métricas cuantificadas de la jornada.
  insert into resultados_jornada (iniciativa_id, metrica, valor, unidad)
  select p_iniciativa,
         (m->>'metrica'),
         (m->>'valor')::double precision,
         coalesce(m->>'unidad', '')
  from jsonb_array_elements(coalesce(p_metricas, '[]'::jsonb)) as m
  where coalesce(m->>'metrica', '') <> '';

  -- Bajar la gravedad de la zona (wow: critico -> medio).
  if z is not null then
    update zonas set nivel_gravedad = case nivel_gravedad
      when 'critico' then 'medio'::nivel_gravedad
      when 'alto'    then 'bajo'::nivel_gravedad
      when 'medio'   then 'bajo'::nivel_gravedad
      else 'recuperada'::nivel_gravedad
    end,
    actualizada_en = now()
    where id = z;
  end if;

  update iniciativas set estado = 'completada' where id = p_iniciativa;
end $$;

-- Solo el service_role puede ejecutarla (la llama el Server Action del servidor).
revoke execute on function cerrar_jornada(uuid, uuid[], jsonb) from anon, authenticated;
