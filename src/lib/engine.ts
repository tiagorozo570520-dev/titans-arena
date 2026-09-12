import type { Enrollment, Match, Standing } from "@/lib/types";

function pairKey(a: string, b: string) {
  return [a, b].sort().join("|");
}

/** Cada equipo juega `games` partidos (máx. n-1). */
export function buildLeaguePairs(ids: string[], games = 8): [string, string][] {
  const n = ids.length;
  if (n < 2) return [];
  const target = Math.min(games, n - 1);

  for (let attempt = 0; attempt < 120; attempt++) {
    const order = [...ids].sort(() => Math.random() - 0.5);
    const need: Record<string, number> = Object.fromEntries(order.map((id) => [id, target]));
    const seen = new Set<string>();
    const pairs: [string, string][] = [];
    let guard = 0;
    let ok = true;

    while (order.some((id) => need[id] > 0)) {
      if (guard++ > 30000) {
        ok = false;
        break;
      }
      const needy = order.filter((id) => need[id] > 0).sort((a, b) => need[b] - need[a]);
      if (needy.length < 2) {
        ok = false;
        break;
      }
      let placed = false;
      for (const a of needy) {
        const opps = needy.filter((b) => b !== a && !seen.has(pairKey(a, b)));
        if (!opps.length) continue;
        const b = opps[Math.floor(Math.random() * opps.length)];
        pairs.push([a, b]);
        seen.add(pairKey(a, b));
        need[a]--;
        need[b]--;
        placed = true;
        break;
      }
      if (!placed) {
        ok = false;
        break;
      }
    }
    if (ok && order.every((id) => need[id] === 0)) return pairs;
  }
  return [];
}

export function computeStandings(playerIds: string[], matches: Match[]): Standing[] {
  const table: Record<string, Standing> = {};
  playerIds.forEach((id) => {
    table[id] = {
      playerId: id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      gf: 0,
      gc: 0,
      gd: 0,
      points: 0,
    };
  });

  matches
    .filter((m) => m.status === "confirmed" && m.scoreA != null && m.scoreB != null)
    .forEach((m) => {
      const a = table[m.playerAId];
      const b = table[m.playerBId];
      if (!a || !b) return;
      a.played++;
      b.played++;
      a.gf += m.scoreA!;
      a.gc += m.scoreB!;
      b.gf += m.scoreB!;
      b.gc += m.scoreA!;
      if (m.scoreA! > m.scoreB!) {
        a.wins++;
        b.losses++;
        a.points += 3;
      } else if (m.scoreA! < m.scoreB!) {
        b.wins++;
        a.losses++;
        b.points += 3;
      } else {
        a.draws++;
        b.draws++;
        a.points += 1;
        b.points += 1;
      }
    });

  Object.values(table).forEach((s) => {
    s.gd = s.gf - s.gc;
  });

  const list = Object.values(table);
  const h2h = (a: string, b: string) => {
    let pa = 0;
    let pb = 0;
    let gda = 0;
    matches
      .filter((m) => m.status === "confirmed" && m.scoreA != null)
      .filter(
        (m) =>
          (m.playerAId === a && m.playerBId === b) ||
          (m.playerAId === b && m.playerBId === a)
      )
      .forEach((m) => {
        const aIsA = m.playerAId === a;
        const ga = aIsA ? m.scoreA! : m.scoreB!;
        const gb = aIsA ? m.scoreB! : m.scoreA!;
        gda += ga - gb;
        if (ga > gb) pa += 3;
        else if (ga < gb) pb += 3;
        else {
          pa += 1;
          pb += 1;
        }
      });
    if (pa !== pb) return pb - pa;
    return -gda;
  };

  return list.sort(
    (x, y) => y.points - x.points || h2h(x.playerId, y.playerId) || y.gd - x.gd || y.gf - x.gf
  );
}

/** Ida + vuelta: más goles en el global. Empate → null (tercer partido / penales). */
export function aggregateWinner(matches: Match[]): string | null {
  const pens = matches.filter((m) => m.round.includes("Desempate"));
  if (pens.length) {
    const p = pens[pens.length - 1];
    if (p.status !== "confirmed" || p.scoreA == null || p.scoreB == null || p.scoreA === p.scoreB) return null;
    return p.scoreA > p.scoreB ? p.playerAId : p.playerBId;
  }
  const legs = matches.filter((m) => !m.round.includes("Desempate"));
  const gf: Record<string, number> = {};
  legs.forEach((m) => {
    gf[m.playerAId] = (gf[m.playerAId] || 0) + (m.scoreA ?? 0);
    gf[m.playerBId] = (gf[m.playerBId] || 0) + (m.scoreB ?? 0);
  });
  const ids = Object.keys(gf);
  if (ids.length < 2) return ids[0] || null;
  const [x, y] = ids;
  if (gf[x] === gf[y]) return null;
  return gf[x] > gf[y] ? x : y;
}

export function makeMatch(
  tournamentId: string,
  round: string,
  a: Enrollment | { playerId: string; teamId?: string },
  b: Enrollment | { playerId: string; teamId?: string },
  suffix: string
): Match {
  return {
    id: `m${Date.now()}-${suffix}-${Math.random().toString(36).slice(2, 7)}`,
    tournamentId,
    round,
    playerAId: a.playerId,
    playerBId: b.playerId,
    teamAId: a.teamId,
    teamBId: b.teamId,
    status: "pending",
  };
}

export function twoLegMatches(
  tournamentId: string,
  round: string,
  a: Enrollment | { playerId: string; teamId?: string },
  b: Enrollment | { playerId: string; teamId?: string },
  i: number
): Match[] {
  return [
    makeMatch(tournamentId, `${round} · Ida`, a, b, `${i}-ida`),
    makeMatch(tournamentId, `${round} · Vuelta`, b, a, `${i}-vuelta`),
  ];
}

export function buildMundialGroups(ids: string[]): { name: string; ids: string[] }[] {
  const letters = "ABCDEFGH".split("");
  const shuffled = [...ids].sort(() => Math.random() - 0.5);
  const size = Math.max(3, Math.ceil(shuffled.length / 8));
  const groups: { name: string; ids: string[] }[] = [];
  let idx = 0;
  for (const L of letters) {
    if (idx >= shuffled.length) break;
    groups.push({ name: `Grupo ${L}`, ids: shuffled.slice(idx, idx + size) });
    idx += size;
  }
  return groups.filter((g) => g.ids.length >= 2);
}

export function groupRoundRobin(ids: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      pairs.push([ids[i], ids[j]]);
    }
  }
  return pairs;
}
