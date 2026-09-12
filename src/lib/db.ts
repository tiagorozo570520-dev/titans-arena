import { supabase, supabaseEnabled } from "@/lib/supabase";
import type {
  Player,
  Team,
  Tournament,
  Enrollment,
  Match,
  Champion,
  Notification,
  Rank,
  Platform,
  FormatType,
  TournamentStatus,
} from "@/lib/types";

export type CloudDump = {
  players: Player[];
  teams: Team[];
  tournaments: Tournament[];
  enrollments: Enrollment[];
  matches: Match[];
  champions: Champion[];
  notifications: Notification[];
};

function mapPlayer(r: Record<string, unknown>): Player {
  return {
    id: String(r.id),
    titansId: String(r.titans_id || ""),
    gamertag: String(r.gamertag || ""),
    email: String(r.email || ""),
    phone: (r.phone as string) || undefined,
    avatar: (r.avatar as string) || undefined,
    platform: (r.platform as Platform) || "PS5",
    country: String(r.country || ""),
    rank: (r.rank as Rank) || "ROOKIE",
    points: Number(r.points || 0),
    wins: Number(r.wins || 0),
    losses: Number(r.losses || 0),
    draws: Number(r.draws || 0),
    matches: Number(r.matches || 0),
    goals: Number(r.goals || 0),
    goalsAgainst: Number(r.goals_against || 0),
    titles: Number(r.titles || 0),
    trophies: Array.isArray(r.trophies) ? (r.trophies as string[]) : [],
    currentStreak: Number(r.current_streak || 0),
    isAdmin: Boolean(r.is_admin),
    createdAt: String(r.created_at || ""),
  };
}

function playerRow(p: Player) {
  return {
    id: p.id,
    titans_id: p.titansId,
    gamertag: p.gamertag,
    email: p.email,
    phone: p.phone || null,
    avatar: p.avatar || null,
    platform: p.platform,
    country: p.country,
    rank: p.rank,
    points: p.points,
    wins: p.wins,
    losses: p.losses,
    draws: p.draws,
    matches: p.matches,
    goals: p.goals,
    goals_against: p.goalsAgainst,
    titles: p.titles,
    trophies: p.trophies,
    current_streak: p.currentStreak,
    is_admin: !!p.isAdmin,
    created_at: p.createdAt,
  };
}

function mapTeam(r: Record<string, unknown>): Team {
  return {
    id: String(r.id),
    name: String(r.name || ""),
    shortName: String(r.short_name || ""),
    country: String(r.country || ""),
    league: String(r.league || ""),
    logo: (r.logo as string) || undefined,
    primaryColor: String(r.primary_color || "#FFFFFF"),
    secondaryColor: String(r.secondary_color || "#000000"),
    active: r.active !== false,
  };
}

function teamRow(t: Team) {
  return {
    id: t.id,
    name: t.name,
    short_name: t.shortName,
    country: t.country,
    league: t.league,
    logo: t.logo || null,
    primary_color: t.primaryColor,
    secondary_color: t.secondaryColor,
    active: t.active,
  };
}

function mapTournament(r: Record<string, unknown>): Tournament {
  return {
    id: String(r.id),
    name: String(r.name || ""),
    subtitle: (r.subtitle as string) || undefined,
    description: String(r.description || ""),
    image: (r.image as string) || undefined,
    logo: (r.logo as string) || undefined,
    prize: String(r.prize || ""),
    startDate: String(r.start_date || ""),
    endDate: String(r.end_date || ""),
    maxPlayers: Number(r.max_players || 16),
    currentPlayers: Number(r.current_players || 0),
    platform: (r.platform as Platform) || "Crossplay",
    format: (r.format as FormatType) || "eliminacion_directa",
    rules: String(r.rules || ""),
    status: (r.status as TournamentStatus) || "soon",
    useTeams: Boolean(r.use_teams),
    availableTeams: Array.isArray(r.available_teams) ? (r.available_teams as string[]) : [],
    assignmentMode: (r.assignment_mode as Tournament["assignmentMode"]) || "free",
    legs: r.legs === 2 ? 2 : 1,
    primaryColor: (r.primary_color as string) || undefined,
    secondaryColor: (r.secondary_color as string) || undefined,
    createdBy: String(r.created_by || ""),
    createdAt: String(r.created_at || ""),
  };
}

function tournamentRow(t: Tournament) {
  return {
    id: t.id,
    name: t.name,
    subtitle: t.subtitle || null,
    description: t.description,
    image: t.image || null,
    logo: t.logo || null,
    prize: t.prize,
    start_date: t.startDate,
    end_date: t.endDate,
    max_players: t.maxPlayers,
    current_players: t.currentPlayers,
    platform: t.platform,
    format: t.format,
    rules: t.rules,
    status: t.status,
    use_teams: t.useTeams,
    available_teams: t.availableTeams,
    assignment_mode: t.assignmentMode,
    legs: t.legs || 1,
    primary_color: t.primaryColor || null,
    secondary_color: t.secondaryColor || null,
    created_by: t.createdBy,
    created_at: t.createdAt,
  };
}

function mapEnrollment(r: Record<string, unknown>): Enrollment {
  return {
    id: String(r.id),
    tournamentId: String(r.tournament_id || ""),
    playerId: String(r.player_id || ""),
    teamId: (r.team_id as string) || undefined,
    position: r.position != null ? Number(r.position) : undefined,
    joinedAt: String(r.joined_at || ""),
  };
}

function enrollmentRow(e: Enrollment) {
  return {
    id: e.id,
    tournament_id: e.tournamentId,
    player_id: e.playerId,
    team_id: e.teamId || null,
    position: e.position ?? null,
    joined_at: e.joinedAt,
  };
}

function mapMatch(r: Record<string, unknown>): Match {
  return {
    id: String(r.id),
    tournamentId: String(r.tournament_id || ""),
    round: String(r.round || ""),
    playerAId: String(r.player_a_id || ""),
    playerBId: String(r.player_b_id || ""),
    scoreA: r.score_a != null ? Number(r.score_a) : undefined,
    scoreB: r.score_b != null ? Number(r.score_b) : undefined,
    status: (r.status as Match["status"]) || "pending",
    reportedBy: (r.reported_by as string) || undefined,
    screenshot: (r.screenshot as string) || undefined,
    teamAId: (r.team_a_id as string) || undefined,
    teamBId: (r.team_b_id as string) || undefined,
    scheduledAt: (r.scheduled_at as string) || undefined,
  };
}

function matchRow(m: Match) {
  return {
    id: m.id,
    tournament_id: m.tournamentId,
    round: m.round,
    player_a_id: m.playerAId,
    player_b_id: m.playerBId,
    score_a: m.scoreA ?? null,
    score_b: m.scoreB ?? null,
    status: m.status,
    reported_by: m.reportedBy || null,
    screenshot: m.screenshot || null,
    team_a_id: m.teamAId || null,
    team_b_id: m.teamBId || null,
    scheduled_at: m.scheduledAt || null,
  };
}

function mapChampion(r: Record<string, unknown>): Champion {
  return {
    id: String(r.id),
    playerId: String(r.player_id || ""),
    tournamentId: String(r.tournament_id || ""),
    tournamentName: String(r.tournament_name || ""),
    date: String(r.date || ""),
    titlesCount: Number(r.titles_count || 0),
  };
}

function championRow(c: Champion) {
  return {
    id: c.id,
    player_id: c.playerId,
    tournament_id: c.tournamentId,
    tournament_name: c.tournamentName,
    date: c.date,
    titles_count: c.titlesCount,
  };
}

function mapNotif(r: Record<string, unknown>): Notification {
  return {
    id: String(r.id),
    userId: String(r.user_id || ""),
    title: String(r.title || ""),
    message: String(r.message || ""),
    type: (r.type as Notification["type"]) || "info",
    read: Boolean(r.read),
    createdAt: String(r.created_at || ""),
  };
}

function notifRow(n: Notification) {
  return {
    id: n.id,
    user_id: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    created_at: n.createdAt,
  };
}

export async function loadCloud(): Promise<CloudDump | null> {
  if (!supabaseEnabled || !supabase) return null;
  const [p, tm, t, e, m, c, n] = await Promise.all([
    supabase.from("players").select("*"),
    supabase.from("teams").select("*"),
    supabase.from("tournaments").select("*"),
    supabase.from("enrollments").select("*"),
    supabase.from("matches").select("*"),
    supabase.from("champions").select("*"),
    supabase.from("notifications").select("*"),
  ]);
  if (p.error) {
    console.warn("Supabase players:", p.error.message);
    return null;
  }
  return {
    players: (p.data || []).map(mapPlayer),
    teams: (tm.data || []).map(mapTeam),
    tournaments: (t.data || []).map(mapTournament),
    enrollments: (e.data || []).map(mapEnrollment),
    matches: (m.data || []).map(mapMatch),
    champions: (c.data || []).map(mapChampion),
    notifications: (n.data || []).map(mapNotif),
  };
}

export async function saveCloud(dump: CloudDump) {
  if (!supabaseEnabled || !supabase) return;
  const ops = [
    dump.players.length ? supabase.from("players").upsert(dump.players.map(playerRow)) : null,
    dump.teams.length ? supabase.from("teams").upsert(dump.teams.map(teamRow)) : null,
    dump.tournaments.length ? supabase.from("tournaments").upsert(dump.tournaments.map(tournamentRow)) : null,
    dump.enrollments.length ? supabase.from("enrollments").upsert(dump.enrollments.map(enrollmentRow)) : null,
    dump.matches.length ? supabase.from("matches").upsert(dump.matches.map(matchRow)) : null,
    dump.champions.length ? supabase.from("champions").upsert(dump.champions.map(championRow)) : null,
    dump.notifications.length ? supabase.from("notifications").upsert(dump.notifications.map(notifRow)) : null,
  ].filter(Boolean);
  await Promise.all(ops);
}
