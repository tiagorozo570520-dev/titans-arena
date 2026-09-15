-- FASE 4.0 — columnas mínimas del motor (no tabla de standings)

alter table tournaments add column if not exists current_phase text;
alter table tournaments add column if not exists draw_locked boolean default false;

alter table enrollments add column if not exists group_key text;

alter table matches add column if not exists matchday int;

comment on column tournaments.current_phase is 'draw|league|group|r32|r16|qf|sf|final|done';
comment on column tournaments.draw_locked is 'Distribución de grupos congelada';
comment on column enrollments.group_key is 'Grupo A-H u otro código';
comment on column matches.matchday is 'Jornada organizativa; no bloquea el orden de juego';
