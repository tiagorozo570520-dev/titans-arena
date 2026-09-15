-- TITANS ARENA Fase 1
-- 1) DETECTAR duplicados. Ejecuta SOLO este SELECT y revisa el resultado.
--    NO se borran filas.

select
  tournament_id,
  player_id,
  count(*) as veces,
  array_agg(id) as enrollment_ids
from enrollments
group by tournament_id, player_id
having count(*) > 1
order by veces desc;

-- 2) Cuando el SELECT de arriba devuelva 0 filas, descomenta y ejecuta:
--
-- create unique index if not exists enrollments_tournament_player_uidx
--   on enrollments (tournament_id, player_id);
