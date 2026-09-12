-- TITANS ARENA — pégalo en Supabase → SQL Editor → Run

create table if not exists players (
  id text primary key,
  titans_id text unique,
  gamertag text unique,
  email text unique,
  phone text,
  avatar text,
  platform text,
  country text,
  rank text,
  points int default 0,
  wins int default 0,
  losses int default 0,
  draws int default 0,
  matches int default 0,
  goals int default 0,
  goals_against int default 0,
  titles int default 0,
  trophies jsonb default '[]'::jsonb,
  current_streak int default 0,
  is_admin boolean default false,
  created_at text
);

create table if not exists teams (
  id text primary key,
  name text,
  short_name text,
  country text,
  league text,
  logo text,
  primary_color text,
  secondary_color text,
  active boolean default true
);

create table if not exists tournaments (
  id text primary key,
  name text,
  subtitle text,
  description text,
  image text,
  logo text,
  prize text,
  start_date text,
  end_date text,
  max_players int,
  current_players int,
  platform text,
  format text,
  rules text,
  status text,
  use_teams boolean default false,
  available_teams jsonb default '[]'::jsonb,
  assignment_mode text,
  legs int default 1,
  primary_color text,
  secondary_color text,
  created_by text,
  created_at text
);

create table if not exists enrollments (
  id text primary key,
  tournament_id text,
  player_id text,
  team_id text,
  position int,
  joined_at text
);

create table if not exists matches (
  id text primary key,
  tournament_id text,
  round text,
  player_a_id text,
  player_b_id text,
  score_a int,
  score_b int,
  status text,
  reported_by text,
  screenshot text,
  team_a_id text,
  team_b_id text,
  scheduled_at text
);

create table if not exists champions (
  id text primary key,
  player_id text,
  tournament_id text,
  tournament_name text,
  date text,
  titles_count int
);

create table if not exists notifications (
  id text primary key,
  user_id text,
  title text,
  message text,
  type text,
  read boolean default false,
  created_at text
);

alter table players enable row level security;
alter table teams enable row level security;
alter table tournaments enable row level security;
alter table enrollments enable row level security;
alter table matches enable row level security;
alter table champions enable row level security;
alter table notifications enable row level security;

create policy "public_all_players" on players for all using (true) with check (true);
create policy "public_all_teams" on teams for all using (true) with check (true);
create policy "public_all_tournaments" on tournaments for all using (true) with check (true);
create policy "public_all_enrollments" on enrollments for all using (true) with check (true);
create policy "public_all_matches" on matches for all using (true) with check (true);
create policy "public_all_champions" on champions for all using (true) with check (true);
create policy "public_all_notifications" on notifications for all using (true) with check (true);
