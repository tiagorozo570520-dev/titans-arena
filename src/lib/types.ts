export type TournamentStatus = "open" | "soon" | "live" | "finished";
export type Rank = "ROOKIE" | "WARRIOR" | "ELITE" | "TITAN" | "LEGEND" | "TITANS GOD";
export type Platform = "PS5" | "Xbox" | "PC" | "Mobile" | "Crossplay";
export type FormatType =
  | "liga"
  | "grupos_eliminacion"
  | "eliminacion_directa"
  | "ida_vuelta"
  | "partido_unico"
  | "mundial"
  | "champions"
  | "copa"
  | "2vs2"
  | "relampago";

/** Fase competitiva persistida. El motor decide la siguiente. */
export type CompetitionPhase =
  | "draw"
  | "league"
  | "group"
  | "r32"
  | "r16"
  | "qf"
  | "sf"
  | "final"
  | "done";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  country: string;
  league: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  active: boolean;
}

export interface Player {
  id: string;
  titansId: string;
  gamertag: string;
  email: string;
  password?: string;
  avatar?: string;
  /** WhatsApp en formato internacional sin + ni espacios, ej: 5215512345678 */
  phone?: string;
  platform: Platform;
  country: string;
  rank: Rank;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  matches: number;
  goals: number;
  goalsAgainst: number;
  titles: number;
  trophies: string[];
  currentStreak: number;
  isAdmin?: boolean;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  image?: string;
  logo?: string;
  prize: string;
  startDate: string;
  endDate: string;
  maxPlayers: number;
  currentPlayers: number;
  platform: Platform;
  format: FormatType;
  rules: string;
  status: TournamentStatus;
  useTeams: boolean;
  availableTeams: string[]; // team ids
  assignmentMode: "free" | "random" | "manual" | "draft" | "sorteo";
  /** 1 = partido único, 2 = ida y vuelta */
  legs?: 1 | 2;
  groupCount?: number;
  qualifyPerGroup?: number;
  /** Fase del motor universal (4.0). Ausente = inferir. */
  currentPhase?: CompetitionPhase;
  /** Distribución de grupos congelada. */
  drawLocked?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  createdBy: string;
  createdAt: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  round: string;
  playerAId: string;
  playerBId: string;
  scoreA?: number;
  scoreB?: number;
  status: "pending" | "reported" | "confirmed" | "disputed" | "voided";
  reportedBy?: string;
  screenshot?: string;
  teamAId?: string;
  teamBId?: string;
  scheduledAt?: string;
  /** Jornada organizativa. No bloquea el orden de juego. */
  matchday?: number;
}

export interface Enrollment {
  id: string;
  tournamentId: string;
  playerId: string;
  teamId?: string;
  position?: number;
  /** Grupo A–H u otro código del formato. */
  groupKey?: string;
  joinedAt: string;
}

export interface Standing {
  playerId: string;
  teamId?: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  gc: number;
  gd: number;
  points: number;
}

export interface Dispute {
  id: string;
  matchId: string;
  reportedBy: string;
  reason: string;
  evidence?: string;
  status: "open" | "resolved" | "rejected";
  resolution?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "match" | "tournament";
  read: boolean;
  createdAt: string;
}

export interface Champion {
  id: string;
  playerId: string;
  tournamentId: string;
  tournamentName: string;
  date: string;
  titlesCount: number;
}
