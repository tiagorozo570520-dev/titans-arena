import { Player, Tournament, Team, Match, Enrollment, Champion, Notification } from "@/lib/types";

export { WHATSAPP_COMMUNITY_URL } from "@/lib/whatsapp";

/** Biblioteca de clubes (no son jugadores). El admin puede agregar más. */
export const teams: Team[] = [
  { id: "t1", name: "Real Madrid", shortName: "RMA", country: "España", league: "LaLiga", primaryColor: "#FFFFFF", secondaryColor: "#00529F", active: true },
  { id: "t2", name: "FC Barcelona", shortName: "BAR", country: "España", league: "LaLiga", primaryColor: "#A50044", secondaryColor: "#004D98", active: true },
  { id: "t3", name: "Manchester City", shortName: "MCI", country: "Inglaterra", league: "Premier League", primaryColor: "#6CABDD", secondaryColor: "#1C2C5B", active: true },
  { id: "t4", name: "Liverpool", shortName: "LIV", country: "Inglaterra", league: "Premier League", primaryColor: "#C8102E", secondaryColor: "#00B2A9", active: true },
  { id: "t5", name: "Arsenal", shortName: "ARS", country: "Inglaterra", league: "Premier League", primaryColor: "#EF0107", secondaryColor: "#063672", active: true },
  { id: "t6", name: "Chelsea", shortName: "CHE", country: "Inglaterra", league: "Premier League", primaryColor: "#034694", secondaryColor: "#DBA111", active: true },
  { id: "t7", name: "Bayern Munich", shortName: "BAY", country: "Alemania", league: "Bundesliga", primaryColor: "#DC052D", secondaryColor: "#0066B2", active: true },
  { id: "t8", name: "Borussia Dortmund", shortName: "BVB", country: "Alemania", league: "Bundesliga", primaryColor: "#FDE100", secondaryColor: "#000000", active: true },
  { id: "t9", name: "Paris Saint-Germain", shortName: "PSG", country: "Francia", league: "Ligue 1", primaryColor: "#004170", secondaryColor: "#DA291C", active: true },
  { id: "t10", name: "Inter Milan", shortName: "INT", country: "Italia", league: "Serie A", primaryColor: "#010E80", secondaryColor: "#A29161", active: true },
  { id: "t11", name: "AC Milan", shortName: "MIL", country: "Italia", league: "Serie A", primaryColor: "#FB090B", secondaryColor: "#000000", active: true },
  { id: "t12", name: "Juventus", shortName: "JUV", country: "Italia", league: "Serie A", primaryColor: "#000000", secondaryColor: "#FFFFFF", active: true },
  { id: "t13", name: "Atlético de Madrid", shortName: "ATM", country: "España", league: "LaLiga", primaryColor: "#CB3524", secondaryColor: "#FFFFFF", active: true },
  { id: "t14", name: "Napoli", shortName: "NAP", country: "Italia", league: "Serie A", primaryColor: "#12A0D7", secondaryColor: "#FFFFFF", active: true },
  { id: "t15", name: "Manchester United", shortName: "MUN", country: "Inglaterra", league: "Premier League", primaryColor: "#DA291C", secondaryColor: "#FBE122", active: true },
  { id: "t16", name: "Tottenham", shortName: "TOT", country: "Inglaterra", league: "Premier League", primaryColor: "#132257", secondaryColor: "#FFFFFF", active: true },
  { id: "t17", name: "Aston Villa", shortName: "AVL", country: "Inglaterra", league: "Premier League", primaryColor: "#670E36", secondaryColor: "#95BFE5", active: true },
  { id: "t18", name: "Newcastle", shortName: "NEW", country: "Inglaterra", league: "Premier League", primaryColor: "#241F20", secondaryColor: "#FFFFFF", active: true },
  { id: "t19", name: "Bayer Leverkusen", shortName: "B04", country: "Alemania", league: "Bundesliga", primaryColor: "#E32221", secondaryColor: "#000000", active: true },
  { id: "t20", name: "RB Leipzig", shortName: "RBL", country: "Alemania", league: "Bundesliga", primaryColor: "#DD0741", secondaryColor: "#FFFFFF", active: true },
  { id: "t21", name: "Atalanta", shortName: "ATA", country: "Italia", league: "Serie A", primaryColor: "#1E71B8", secondaryColor: "#000000", active: true },
  { id: "t22", name: "AS Roma", shortName: "ROM", country: "Italia", league: "Serie A", primaryColor: "#8E1F2F", secondaryColor: "#F0BC42", active: true },
  { id: "t23", name: "Lazio", shortName: "LAZ", country: "Italia", league: "Serie A", primaryColor: "#87D8F7", secondaryColor: "#FFFFFF", active: true },
  { id: "t24", name: "Monaco", shortName: "ASM", country: "Francia", league: "Ligue 1", primaryColor: "#E31937", secondaryColor: "#FFFFFF", active: true },
  { id: "t25", name: "Lille", shortName: "LIL", country: "Francia", league: "Ligue 1", primaryColor: "#E01E13", secondaryColor: "#1D1D1B", active: true },
  { id: "t26", name: "Benfica", shortName: "BEN", country: "Portugal", league: "Liga Portugal", primaryColor: "#E31E24", secondaryColor: "#FFFFFF", active: true },
  { id: "t27", name: "Porto", shortName: "POR", country: "Portugal", league: "Liga Portugal", primaryColor: "#003893", secondaryColor: "#FFFFFF", active: true },
  { id: "t28", name: "Sporting CP", shortName: "SCP", country: "Portugal", league: "Liga Portugal", primaryColor: "#008057", secondaryColor: "#FFF200", active: true },
  { id: "t29", name: "Ajax", shortName: "AJA", country: "Países Bajos", league: "Eredivisie", primaryColor: "#D2122E", secondaryColor: "#FFFFFF", active: true },
  { id: "t30", name: "PSV", shortName: "PSV", country: "Países Bajos", league: "Eredivisie", primaryColor: "#E31C23", secondaryColor: "#FFFFFF", active: true },
  { id: "t31", name: "Feyenoord", shortName: "FEY", country: "Países Bajos", league: "Eredivisie", primaryColor: "#F03024", secondaryColor: "#FFFFFF", active: true },
  { id: "t32", name: "Club Brugge", shortName: "CLU", country: "Bélgica", league: "Pro League", primaryColor: "#0072CE", secondaryColor: "#000000", active: true },
  { id: "t33", name: "Celtic", shortName: "CEL", country: "Escocia", league: "Premiership", primaryColor: "#00843D", secondaryColor: "#FFFFFF", active: true },
  { id: "t34", name: "Galatasaray", shortName: "GAL", country: "Turquía", league: "Süper Lig", primaryColor: "#FDB912", secondaryColor: "#A32638", active: true },
  { id: "t35", name: "Shakhtar Donetsk", shortName: "SHK", country: "Ucrania", league: "Premier Liha", primaryColor: "#E87722", secondaryColor: "#000000", active: true },
  { id: "t36", name: "Red Bull Salzburg", shortName: "RBS", country: "Austria", league: "Bundesliga AT", primaryColor: "#DF0D18", secondaryColor: "#FFFFFF", active: true },
];

/** Solo el admin real. Cambia gamertag, email y phone por los TUYOS. */
export const players: Player[] = [
  {
    id: "p1",
    titansId: "TITANS-0001",
    gamertag: "AdminTitans",
    email: "admin@titans.gg",
    phone: "",
    platform: "PS5",
    country: "Colombia",
    rank: "ROOKIE",
    points: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    matches: 0,
    goals: 0,
    goalsAgainst: 0,
    titles: 0,
    trophies: [],
    currentStreak: 0,
    isAdmin: true,
    createdAt: new Date().toISOString().slice(0, 10),
  },
];

export const tournaments: Tournament[] = [];
export const enrollments: Enrollment[] = [];
export const matches: Match[] = [];
export const champions: Champion[] = [];
export const notifications: Notification[] = [];

export function getRankFromPoints(points: number): string {
  if (points >= 2500) return "TITANS GOD";
  if (points >= 2000) return "LEGEND";
  if (points >= 1500) return "TITAN";
  if (points >= 1000) return "ELITE";
  if (points >= 500) return "WARRIOR";
  return "ROOKIE";
}

export function getWinRate(p: Player): number {
  if (p.matches === 0) return 0;
  return Math.round((p.wins / p.matches) * 100);
}
