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
