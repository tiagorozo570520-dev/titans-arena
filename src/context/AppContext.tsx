"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import {
  players as seedPlayers,
  tournaments as seedTournaments,
  teams as seedTeams,
  enrollments as seedEnrollments,
  matches as seedMatches,
  champions as seedChampions,
  notifications as seedNotifications,
  getRankFromPoints,
} from "@/data/mock";
import type {
  Player,
  Tournament,
  Team,
  Match,
  Enrollment,
  Champion,
  Notification,
  Rank,
} from "@/lib/types";
import {
  loadCloud,
  insertPlayer,
  findPlayerByLogin,
  insertEnrollment,
  fetchEnrollments,
  fetchEnrollmentsByTournament,
  insertTournament,
  insertMatches,
  fetchMatchesByTournament,
} from "@/lib/db";
import {
  aggregateWinner,
  buildLeaguePairs,
  buildMundialGroups,
  computeStandings,
  groupRoundRobin,
  makeMatch,
  twoLegMatches,
} from "@/lib/engine";

const STORAGE_KEY = "titans-arena-db-v1";
const SESSION_KEY = "titans-arena-session-v1";

interface AppState {
  currentUser: Player | null;
  players: Player[];
  tournaments: Tournament[];
  teams: Team[];
  enrollments: Enrollment[];
  matches: Match[];
  champions: Champion[];
  notifications: Notification[];
  isLoggedIn: boolean;
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: Partial<Player> & { email: string; gamertag: string; password: string; phone?: string }) => boolean;
  enrollInTournament: (tournamentId: string, teamId?: string) => Promise<{ success: boolean; message: string }>;
  createTournament: (data: Partial<Tournament>) => void;
  reportResult: (matchId: string, scoreA: number, scoreB: number) => void;
  confirmResult: (matchId: string) => void;
  disputeResult: (matchId: string) => void;
  addTeam: (team: Omit<Team, "id">) => void;
  updateTeam: (id: string, data: Partial<Team>) => void;
  updatePlayer: (id: string, data: Partial<Player>) => void;
  generateFixtures: (tournamentId: string) => Promise<{ success: boolean; message: string }>;
  advanceRound: (tournamentId: string) => { success: boolean; message: string };
  finishTournament: (tournamentId: string) => { success: boolean; message: string };
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

type PersistShape = {
  players: Player[];
  tournaments: Tournament[];
  teams: Team[];
  enrollments: Enrollment[];
  matches: Match[];
  champions: Champion[];
  notifications: Notification[];
};

function loadPersist(): PersistShape | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistShape;
  } catch {
    return null;
  }
}

function savePersist(data: PersistShape) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("No se pudo guardar (imágenes muy pesadas o storage lleno)", e);
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>(seedPlayers);
  const [tournaments, setTournaments] = useState<Tournament[]>(seedTournaments);
  const [teams, setTeams] = useState<Team[]>(seedTeams);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(seedEnrollments);
  const [matches, setMatches] = useState<Match[]>(seedMatches);
  const [champions, setChampions] = useState<Champion[]>(seedChampions);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cloud = await loadCloud();
      const saved = loadPersist();
      // Supabase = source of truth. localStorage = cache only if the cloud is unreachable.
      const src = cloud || saved;
      if (!cancelled && src) {
        if (cloud) {
          setPlayers(cloud.players.length ? cloud.players : seedPlayers);
          setTournaments(cloud.tournaments);
          setTeams(cloud.teams.length ? cloud.teams : seedTeams);
          setEnrollments(cloud.enrollments);
          setMatches(cloud.matches);
          setChampions(cloud.champions);
          setNotifications(cloud.notifications);
        } else if (saved) {
          setPlayers(saved.players?.length ? saved.players : seedPlayers);
          setTournaments(saved.tournaments || []);
          setTeams(saved.teams?.length ? saved.teams : seedTeams);
          setEnrollments(saved.enrollments || []);
          setMatches(saved.matches || []);
          setChampions(saved.champions || []);
          setNotifications(saved.notifications || []);
        }
        const sessionId = localStorage.getItem(SESSION_KEY);
        const pool = (cloud?.players?.length ? cloud.players : src.players) || seedPlayers;
        if (sessionId) {
          const u = pool.find((p) => p.id === sessionId);
          if (u) setCurrentUser(u);
        }
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const dump = {
      players,
      tournaments,
      teams,
      enrollments,
      matches,
      champions,
      notifications,
    };
    savePersist(dump);
  }, [hydrated, players, tournaments, teams, enrollments, matches, champions, notifications]);

  useEffect(() => {
    if (!hydrated) return;
    if (currentUser) localStorage.setItem(SESSION_KEY, currentUser.id);
    else localStorage.removeItem(SESSION_KEY);
  }, [hydrated, currentUser]);

  const login = useCallback(async (email: string, _password: string) => {
    const q = email.trim().toLowerCase();
    const fromCloud = await findPlayerByLogin(q);
    const local =
      players.find((p) => p.email.toLowerCase() === q) ||
      players.find((p) => p.gamertag.toLowerCase() === q);
    const user = fromCloud || local;
    if (user) {
      setCurrentUser(user);
      setPlayers((prev) => (prev.some((p) => p.id === user.id) ? prev : [...prev, user]));
      return true;
    }
    return false;
  }, [players]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const register = useCallback(
    (data: Partial<Player> & { email: string; gamertag: string; password: string; phone?: string }) => {
      const phone = data.phone ? data.phone.replace(/\D/g, "") : "";
      if (!phone || phone.length < 10) {
        return false;
      }
      if (players.some((p) => p.email.toLowerCase() === data.email.toLowerCase() || p.gamertag.toLowerCase() === data.gamertag.toLowerCase())) {
        return false;
      }
      const nums = players.map((p) => parseInt(String(p.titansId || "").replace(/\D/g, ""), 10) || 0);
      const nextNum = Math.max(1000, ...nums) + 1;
      const newPlayer: Player = {
        id: `p${Date.now()}${Math.floor(Math.random() * 1000)}`,
        titansId: `TITANS-${String(nextNum).padStart(4, "0")}`,
        gamertag: data.gamertag,
        email: data.email,
        phone,
        platform: data.platform || "PS5",
        country: data.country || "Colombia",
        rank: "ROOKIE" as Rank,
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
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setPlayers((prev) => [...prev, newPlayer]);
      setCurrentUser(newPlayer);
      insertPlayer(newPlayer).catch(() => {});
      return true;
    },
    [players]
  );

  const enrollInTournament = useCallback(
    async (tournamentId: string, teamId?: string) => {
      if (!currentUser) return { success: false, message: "Debes iniciar sesión" };
      const tournament = tournaments.find((t) => t.id === tournamentId);
      if (!tournament) return { success: false, message: "Torneo no encontrado" };
      if (tournament.status !== "open") return { success: false, message: "Inscripciones cerradas" };

      const live = await fetchEnrollments();
      const mine = live.filter((e) => e.tournamentId === tournamentId);
      if (mine.some((e) => e.playerId === currentUser.id)) {
        setEnrollments(live);
        setTournaments((prev) =>
          prev.map((t) => (t.id === tournamentId ? { ...t, currentPlayers: mine.length } : t))
        );
        return { success: false, message: "Ya estás inscrito (nube)" };
      }
      if (mine.length >= tournament.maxPlayers) {
        return { success: false, message: "Torneo lleno" };
      }
      if (tournament.useTeams && teamId) {
        if (mine.some((e) => e.teamId === teamId)) {
          return { success: false, message: "Equipo ya seleccionado" };
        }
      }

      const newEnrollment: Enrollment = {
        id: `e${Date.now()}`,
        tournamentId,
        playerId: currentUser.id,
        teamId,
        position: mine.length + 1,
        joinedAt: new Date().toISOString().slice(0, 10),
      };
      const saved = await insertEnrollment(newEnrollment);
      if (!saved.ok) {
        if (saved.error === "duplicate") {
          const freshDup = await fetchEnrollments();
          setEnrollments(freshDup);
          return { success: false, message: "Ya estás inscrito" };
        }
        return { success: false, message: "No se pudo guardar: " + saved.error };
      }
      const fresh = await fetchEnrollments();
      setEnrollments(fresh);
      return { success: true, message: "¡INSCRIPCIÓN CONFIRMADA!" };
    },
    [currentUser, tournaments]
  );

  const createTournament = useCallback((data: Partial<Tournament>) => {
    const newT: Tournament = {
      id: `tour${Date.now()}`,
      name: data.name || "Nuevo Torneo",
      subtitle: data.subtitle,
      description: data.description || "",
      image: data.image,
      logo: data.logo,
      prize: data.prize || "Por definir",
      startDate: data.startDate || new Date().toISOString().slice(0, 10),
      endDate: data.endDate || new Date().toISOString().slice(0, 10),
      maxPlayers: data.maxPlayers || 16,
      currentPlayers: 0,
      platform: data.platform || "Crossplay",
      format: data.format || "eliminacion_directa",
      rules: data.rules || "",
      status: data.status || "soon",
      useTeams: data.useTeams || false,
      availableTeams: data.availableTeams || teams.map((t) => t.id),
      assignmentMode: data.assignmentMode || "free",
      legs: data.legs === 2 ? 2 : 1,
      groupCount: data.groupCount || 0,
      qualifyPerGroup: data.qualifyPerGroup || 2,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      createdBy: currentUser?.id || "p1",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTournaments((prev) => [newT, ...prev]);
    insertTournament(newT).catch((err) => console.warn("insertTournament", err));
  }, [currentUser, teams]);

  const reportResult = useCallback((matchId: string, scoreA: number, scoreB: number) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, scoreA, scoreB, status: "reported", reportedBy: currentUser?.id }
          : m
      )
    );
  }, [currentUser]);

  const applyConfirmedStats = (m: Match) => {
    const a = m.scoreA ?? 0;
    const b = m.scoreB ?? 0;
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== m.playerAId && p.id !== m.playerBId) return p;
        const isA = p.id === m.playerAId;
        const gf = isA ? a : b;
        const ga = isA ? b : a;
        const win = gf > ga;
        const draw = gf === ga;
        const pts = p.points + (win ? 25 : draw ? 8 : 5);
        return {
          ...p,
          matches: p.matches + 1,
          wins: p.wins + (win ? 1 : 0),
          draws: p.draws + (draw ? 1 : 0),
          losses: p.losses + (!win && !draw ? 1 : 0),
          goals: p.goals + gf,
          goalsAgainst: p.goalsAgainst + ga,
          points: pts,
          currentStreak: win ? Math.max(p.currentStreak, 0) + 1 : 0,
          rank: getRankFromPoints(pts) as Rank,
        };
      })
    );
  };

  const confirmResult = useCallback((matchId: string) => {
    setMatches((prev) => {
      const found = prev.find((m) => m.id === matchId);
      if (found && found.status !== "confirmed") applyConfirmedStats(found);
      return prev.map((m) => (m.id === matchId ? { ...m, status: "confirmed" as const } : m));
    });
  }, []);

  const disputeResult = useCallback((matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: "disputed" as const } : m))
    );
  }, []);

  const generateFixtures = useCallback(
    async (tournamentId: string) => {
      const enrolled = await fetchEnrollmentsByTournament(tournamentId);
      setEnrollments((prev) => {
        const others = prev.filter((e) => e.tournamentId !== tournamentId);
        return [...others, ...enrolled];
      });
      if (enrolled.length < 2) {
        return { success: false, message: "Se necesitan al menos 2 inscritos" };
      }
      const cloudMatches = await fetchMatchesByTournament(tournamentId);
      const already = cloudMatches.length > 0 || matches.some((m) => m.tournamentId === tournamentId);
      if (already) return { success: false, message: "Este torneo ya tiene partidos" };

      const tourney = tournaments.find((x) => x.id === tournamentId);
      const uniqueEnrolled = enrolled.filter(
        (e, i, arr) => arr.findIndex((x) => x.playerId === e.playerId) === i
      );
      const byId = Object.fromEntries(uniqueEnrolled.map((e) => [e.playerId, e]));
      const ids = uniqueEnrolled.map((e) => e.playerId);
      const created: Match[] = [];

      if (tourney?.format === "champions") {
        const games = Math.min(8, ids.length - 1);
        const pairs = buildLeaguePairs(ids, games);
        if (!pairs.length) return { success: false, message: "No se pudo armar la fase liga" };
        pairs.forEach(([a, b], i) => {
          created.push(makeMatch(tournamentId, "Fase Liga", byId[a], byId[b], `liga-${i}`));
        });
        setMatches((prev) => [...prev, ...created]);
        setTournaments((prev) =>
          prev.map((t) => (t.id === tournamentId ? { ...t, status: "live" } : t))
        );
        await insertMatches(created);
        return {
          success: true,
          message: `Fase liga: ${created.length} partidos. Cada uno juega ${games}.`,
        };
      }

      if (tourney?.format === "mundial" || (tourney?.groupCount && tourney.groupCount >= 2)) {
        const nGroups = tourney?.format === "mundial" ? 8 : tourney!.groupCount!;
        // rebuild with exact group count
        const shuffled = [...ids].sort(() => Math.random() - 0.5);
        const g2: { name: string; ids: string[] }[] = [];
        const letters = "ABCDEFGH";
        const size = Math.ceil(shuffled.length / nGroups);
        for (let g = 0; g < nGroups; g++) {
          const chunk = shuffled.slice(g * size, (g + 1) * size);
          if (chunk.length >= 2) g2.push({ name: `Grupo ${letters[g]}`, ids: chunk });
        }
        const use = g2.length ? g2 : buildMundialGroups(ids);
        use.forEach((g) => {
          groupRoundRobin(g.ids).forEach(([a, b], i) => {
            created.push(makeMatch(tournamentId, g.name, byId[a], byId[b], `${g.name}-${i}`));
          });
        });
        setMatches((prev) => [...prev, ...created]);
        setTournaments((prev) =>
          prev.map((t) => (t.id === tournamentId ? { ...t, status: "live" } : t))
        );
        await insertMatches(created);
        return { success: true, message: `Fase de grupos: ${created.length} partidos en ${use.length} grupos.` };
      }

      const shuffled = [...uniqueEnrolled].sort(() => Math.random() - 0.5);
      const twoLegs = tourney?.legs === 2 || tourney?.format === "ida_vuelta";
      for (let i = 0; i < shuffled.length - 1; i += 2) {
        const a = shuffled[i];
        const b = shuffled[i + 1];
        if (twoLegs) created.push(...twoLegMatches(tournamentId, "Ronda 1", a, b, i));
        else created.push(makeMatch(tournamentId, "Ronda 1", a, b, `${i}`));
      }
      setMatches((prev) => [...prev, ...created]);
      setTournaments((prev) =>
        prev.map((t) => (t.id === tournamentId ? { ...t, status: "live" } : t))
      );
      await insertMatches(created);
      return { success: true, message: `${created.length} partidos creados` };
    },
    [enrollments, matches, tournaments]
  );

  const advanceRound = useCallback(
    (tournamentId: string) => {
      const tMatches = matches.filter((m) => m.tournamentId === tournamentId);
      if (!tMatches.length) return { success: false, message: "No hay partidos" };
      const pending = tMatches.filter((m) => m.status !== "confirmed");
      if (pending.length) return { success: false, message: "Todavía hay partidos sin confirmar" };

      const tourney = tournaments.find((x) => x.id === tournamentId);
      const enrolled = enrollments.filter((e) => e.tournamentId === tournamentId);
      const byId = Object.fromEntries(enrolled.map((e) => [e.playerId, e]));
      const created: Match[] = [];

      const has = (name: string) => tMatches.some((m) => m.round.includes(name));

      if (tourney?.format === "champions") {
        const league = tMatches.filter((m) => m.round === "Fase Liga");
        if (league.length && !has("Playoff") && !has("Octavos")) {
          const table = computeStandings(
            enrolled.map((e) => e.playerId),
            league
          );
          if (table.length < 9) {
            return { success: false, message: "Pocos equipos para playoff UCL. Usa Finalizar." };
          }
          const playoffSeeds = table.slice(8, 24);
          for (let i = 0; i < 8; i++) {
            const hi = playoffSeeds[i];
            const lo = playoffSeeds[playoffSeeds.length - 1 - i];
            if (!hi || !lo) continue;
            created.push(
              ...twoLegMatches(tournamentId, "Playoff", byId[hi.playerId], byId[lo.playerId], i)
            );
          }
          setMatches((prev) => [...prev, ...created]);
          return { success: true, message: `Playoff: 9º-24º cruzados. 1º-8º esperan octavos.` };
        }

        if (has("Playoff") && !has("Octavos")) {
          const table = computeStandings(
            enrolled.map((e) => e.playerId),
            tMatches.filter((m) => m.round === "Fase Liga")
          );
          const top8 = table.slice(0, 8).map((s) => s.playerId);
          const playoff = tMatches.filter((m) => m.round.includes("Playoff"));
          const groups = new Map<string, Match[]>();
          playoff.forEach((m) => {
            const k = [m.playerAId, m.playerBId].sort().join("-");
            groups.set(k, [...(groups.get(k) || []), m]);
          });
          const pTies: Match[][] = [];
          const pWinners: string[] = [];
          groups.forEach((ms) => {
            const w = aggregateWinner(ms);
            if (w) pWinners.push(w);
            else if (!ms.some((x) => x.round.includes("Desempate"))) pTies.push(ms);
          });
          if (pTies.length) {
            pTies.forEach((ms, i) => {
              created.push(
                makeMatch(tournamentId, "Playoff · Desempate", byId[ms[0].playerAId], byId[ms[0].playerBId], `ppen-${i}`)
              );
            });
            setMatches((prev) => [...prev, ...created]);
            return { success: true, message: `${pTies.length} playoff a penales.` };
          }
          // 1 vs winner 16/17 style: pair top8[i] with pWinners[7-i]
          const wSorted = [...pWinners];
          for (let i = 0; i < Math.min(top8.length, wSorted.length); i++) {
            created.push(
              ...twoLegMatches(
                tournamentId,
                "Octavos",
                byId[top8[i]],
                byId[wSorted[wSorted.length - 1 - i]],
                i
              )
            );
          }
          setMatches((prev) => [...prev, ...created]);
          return { success: true, message: `Octavos armados (ida y vuelta).` };
        }

        const koOrder = ["Octavos", "Cuartos", "Semis", "Final"];
        const currentKo = [...koOrder].reverse().find((r) => has(r));
        if (currentKo === "Final") {
          return { success: false, message: "La final ya existe. Usa Finalizar torneo." };
        }
        const nextKo =
          currentKo === "Octavos" ? "Cuartos" : currentKo === "Cuartos" ? "Semis" : currentKo === "Semis" ? "Final" : null;
        if (nextKo && currentKo) {
          const last = tMatches.filter((m) => m.round.includes(currentKo));
          const groups = new Map<string, Match[]>();
          last.forEach((m) => {
            const k = [m.playerAId, m.playerBId].sort().join("-");
            groups.set(k, [...(groups.get(k) || []), m]);
          });
          const ties: Match[][] = [];
          const winners: string[] = [];
          groups.forEach((ms) => {
            const w = aggregateWinner(ms);
            if (w) winners.push(w);
            else if (!ms.some((x) => x.round.includes("Desempate"))) ties.push(ms);
          });
          if (ties.length) {
            ties.forEach((ms, i) => {
              const a = byId[ms[0].playerAId];
              const b = byId[ms[0].playerBId];
              created.push(makeMatch(tournamentId, `${currentKo} · Desempate`, a, b, `pen-${i}`));
            });
            setMatches((prev) => [...prev, ...created]);
            return { success: true, message: `${ties.length} desempate(s) a penales. Jueguen el tercero y confirmen.` };
          }
          if (winners.length < 2) return { success: false, message: "Usa Finalizar torneo." };
          const two = nextKo !== "Final";
          for (let i = 0; i < winners.length - 1; i += 2) {
            if (two) {
              created.push(
                ...twoLegMatches(tournamentId, nextKo, byId[winners[i]], byId[winners[i + 1]], i)
              );
            } else {
              created.push(makeMatch(tournamentId, "Final", byId[winners[i]], byId[winners[i + 1]], "final"));
            }
          }
          setMatches((prev) => [...prev, ...created]);
          return { success: true, message: `${nextKo} generado.` };
        }
      }

      if (tourney?.format === "mundial" || (tourney?.groupCount && tourney.groupCount >= 2)) {
        if (!has("Octavos") && !has("Ronda") && tMatches.some((m) => m.round.startsWith("Grupo"))) {
          const groups = Array.from(new Set(tMatches.map((m) => m.round))).filter((r) =>
            r.startsWith("Grupo")
          );
          const firsts: string[] = [];
          const seconds: string[] = [];
          groups.forEach((g) => {
            const gm = tMatches.filter((m) => m.round === g);
            const ids = Array.from(new Set(gm.flatMap((m) => [m.playerAId, m.playerBId])));
            const st = computeStandings(ids, gm);
            const q = tourney.qualifyPerGroup || 2;
            if (st[0]) firsts.push(st[0].playerId);
            if (q >= 2 && st[1]) seconds.push(st[1].playerId);
            if (q >= 3 && st[2]) seconds.push(st[2].playerId);
          });
          const n = Math.min(firsts.length, seconds.length);
          for (let i = 0; i < n; i++) {
            created.push(
              makeMatch(tournamentId, "Octavos", byId[firsts[i]], byId[seconds[n - 1 - i]], `o-${i}`)
            );
          }
          setMatches((prev) => [...prev, ...created]);
          return { success: true, message: `Octavos: 1° vs 2° de grupos.` };
        }
      }

      const twoLegs = tourney?.legs === 2 || tourney?.format === "ida_vuelta" || tourney?.format === "champions";
      const rounds = Array.from(new Set(tMatches.map((m) => m.round)));
      const lastRound = rounds[rounds.length - 1];
      const baseRound = lastRound.replace(" · Ida", "").replace(" · Vuelta", "");
      const last = tMatches.filter(
        (m) => m.round.replace(" · Ida", "").replace(" · Vuelta", "") === baseRound
      );
      const groups = new Map<string, Match[]>();
      last.forEach((m) => {
        const k = [m.playerAId, m.playerBId].sort().join("-");
        groups.set(k, [...(groups.get(k) || []), m]);
      });
      const ties: Match[][] = [];
      const winners: string[] = [];
      groups.forEach((ms) => {
        const w = aggregateWinner(ms);
        if (w) winners.push(w);
        else if (!ms.some((x) => x.round.includes("Desempate"))) ties.push(ms);
      });
      if (ties.length) {
        ties.forEach((ms, i) => {
          created.push(
            makeMatch(tournamentId, `${baseRound} · Desempate`, byId[ms[0].playerAId], byId[ms[0].playerBId], `pen-${i}`)
          );
        });
        setMatches((prev) => [...prev, ...created]);
        return { success: true, message: `${ties.length} desempate(s) a penales.` };
      }
      if (winners.length < 2) return { success: false, message: "Queda un solo ganador. Usa Finalizar." };
      const nextName = winners.length === 2 ? "Final" : `Ronda ${rounds.length + 1}`;
      const two = twoLegs && nextName !== "Final";
      for (let i = 0; i < winners.length - 1; i += 2) {
        if (two) created.push(...twoLegMatches(tournamentId, nextName, byId[winners[i]], byId[winners[i + 1]], i));
        else created.push(makeMatch(tournamentId, nextName, byId[winners[i]], byId[winners[i + 1]], `${i}`));
      }
      setMatches((prev) => [...prev, ...created]);
      return { success: true, message: `${created.length} partidos de ${nextName}` };
    },
    [matches, tournaments, enrollments]
  );

  const finishTournament = useCallback(
    (tournamentId: string) => {
      const tourney = tournaments.find((t) => t.id === tournamentId);
      if (!tourney) return { success: false, message: "Torneo no encontrado" };
      if (tourney.status === "finished") return { success: false, message: "Ya está finalizado" };

      const tMatches = matches.filter((m) => m.tournamentId === tournamentId && m.status === "confirmed");
      let championId = "";
      if (tMatches.length) {
        const last = tMatches[tMatches.length - 1];
        const a = last.scoreA ?? 0;
        const b = last.scoreB ?? 0;
        championId = a >= b ? last.playerAId : last.playerBId;
      } else {
        const enrolled = enrollments.filter((e) => e.tournamentId === tournamentId);
        championId = enrolled[0]?.playerId || "";
      }
      if (!championId) return { success: false, message: "No hay campeón para asignar" };

      setTournaments((prev) =>
        prev.map((t) => (t.id === tournamentId ? { ...t, status: "finished" as const } : t))
      );
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id !== championId) return p;
          const pts = p.points + 80;
          return {
            ...p,
            titles: p.titles + 1,
            points: pts,
            trophies: p.trophies.includes("CAMPEÓN") ? p.trophies : [...p.trophies, "CAMPEÓN"],
            rank: getRankFromPoints(pts) as Rank,
          };
        })
      );
      const champPlayer = players.find((p) => p.id === championId);
      setChampions((prev) => [
        {
          id: `c${Date.now()}`,
          playerId: championId,
          tournamentId,
          tournamentName: tourney.name,
          date: new Date().toISOString().slice(0, 10),
          titlesCount: (champPlayer?.titles || 0) + 1,
        },
        ...prev,
      ]);
      return { success: true, message: `Campeón: ${champPlayer?.gamertag || championId}` };
    },
    [tournaments, matches, enrollments, players]
  );

  const addTeam = useCallback((team: Omit<Team, "id">) => {
    const newTeam: Team = { ...team, id: `t${Date.now()}` };
    setTeams((prev) => [...prev, newTeam]);
  }, []);

  const updateTeam = useCallback((id: string, data: Partial<Team>) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const updatePlayer = useCallback((id: string, data: Partial<Player>) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
    }
  }, [currentUser]);

  const resetAllData = useCallback(() => {
    setPlayers(seedPlayers);
    setTournaments(seedTournaments);
    setTeams(seedTeams);
    setEnrollments(seedEnrollments);
    setMatches(seedMatches);
    setChampions(seedChampions);
    setNotifications(seedNotifications);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        players,
        tournaments,
        teams,
        enrollments,
        matches,
        champions,
        notifications,
        isLoggedIn: !!currentUser,
        login,
        logout,
        register,
        enrollInTournament,
        createTournament,
        reportResult,
        confirmResult,
        disputeResult,
        addTeam,
        updateTeam,
        updatePlayer,
        generateFixtures,
        advanceRound,
        finishTournament,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
