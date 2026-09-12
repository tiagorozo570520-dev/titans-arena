"use client";

import type { Match, Player } from "@/lib/types";

const KO_ORDER = [
  "Octavos",
  "Cuartos",
  "Semis",
  "Final",
  "Playoff",
  "Ronda 1",
  "Ronda 2",
  "Ronda 3",
  "Ronda 4",
];

function baseRound(r: string) {
  return r.replace(" · Ida", "").replace(" · Vuelta", "").replace(" · Desempate", "");
}

export default function Bracket({
  matches,
  players,
}: {
  matches: Match[];
  players: Player[];
}) {
  const ko = matches.filter((m) => {
    const b = baseRound(m.round);
    return (
      KO_ORDER.some((k) => b === k) ||
      b.startsWith("Ronda") ||
      b === "Playoff" ||
      b === "Octavos" ||
      b === "Cuartos" ||
      b === "Semis" ||
      b === "Final"
    );
  });
  if (!ko.length) return null;

  const nameOf = (id: string) => players.find((p) => p.id === id)?.gamertag || "TBD";

  const columns = new Map<string, Map<string, Match[]>>();
  ko.forEach((m) => {
    const col = baseRound(m.round);
    const pair = [m.playerAId, m.playerBId].sort().join("-");
    if (!columns.has(col)) columns.set(col, new Map());
    const inner = columns.get(col)!;
    inner.set(pair, [...(inner.get(pair) || []), m]);
  });

  const order = [...columns.keys()].sort((a, b) => {
    const ia = KO_ORDER.findIndex((k) => a.startsWith(k) || a === k);
    const ib = KO_ORDER.findIndex((k) => b.startsWith(k) || b === k);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <div>
      <h2 className="font-display font-bold text-gold mb-3">BRACKET</h2>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max items-stretch">
          {order.map((col) => {
            const pairs = [...columns.get(col)!.values()];
            return (
              <div key={col} className="w-56 flex flex-col gap-4">
                <div className="text-[10px] tracking-[0.2em] text-[var(--titans-blue)] font-bold uppercase text-center">
                  {col}
                </div>
                <div className="flex flex-col justify-around gap-4 flex-1">
                  {pairs.map((ms) => {
                    const a = ms[0].playerAId;
                    const b = ms[0].playerBId;
                    const ida = ms.find((x) => x.round.includes("Ida")) || ms[0];
                    const vuelta = ms.find((x) => x.round.includes("Vuelta"));
                    const pen = ms.find((x) => x.round.includes("Desempate"));
                    const ga = (ida.scoreA ?? 0) + (vuelta?.scoreA && vuelta.playerAId === a ? vuelta.scoreA : vuelta?.playerBId === a ? vuelta.scoreB ?? 0 : 0);
                    const gb = (ida.scoreB ?? 0) + (vuelta?.scoreB && vuelta.playerBId === b ? vuelta.scoreB : vuelta?.playerAId === b ? vuelta.scoreA ?? 0 : 0);
                    const simple =
                      !vuelta &&
                      ida.scoreA != null &&
                      ida.scoreB != null
                        ? `${ida.scoreA}-${ida.scoreB}`
                        : vuelta
                        ? `${ga}-${gb}`
                        : "vs";
                    return (
                      <div
                        key={ms[0].id}
                        className="titans-card p-0 overflow-hidden border-[rgba(0,212,255,0.2)]"
                      >
                        <Row
                          name={nameOf(a)}
                          score={
                            ida.scoreA != null
                              ? String(vuelta ? ga : ida.scoreA)
                              : "–"
                          }
                          win={
                            ida.status === "confirmed" &&
                            ((vuelta ? ga > gb : (ida.scoreA ?? 0) > (ida.scoreB ?? 0)) ||
                              (pen && (pen.scoreA ?? 0) > (pen.scoreB ?? 0) && pen.playerAId === a))
                          }
                        />
                        <Row
                          name={nameOf(b)}
                          score={
                            ida.scoreB != null
                              ? String(vuelta ? gb : ida.scoreB)
                              : "–"
                          }
                          win={
                            ida.status === "confirmed" &&
                            ((vuelta ? gb > ga : (ida.scoreB ?? 0) > (ida.scoreA ?? 0)) ||
                              (pen &&
                                ((pen.playerBId === b && (pen.scoreB ?? 0) > (pen.scoreA ?? 0)) ||
                                  (pen.playerAId === b && (pen.scoreA ?? 0) > (pen.scoreB ?? 0))))
                          }
                        />
                        <div className="text-[9px] text-center text-[var(--titans-muted)] py-1 border-t border-white/5">
                          {pen ? `Penales ${pen.scoreA ?? "-"}-${pen.scoreB ?? "-"}` : simple === "vs" ? "Pendiente" : `Global ${simple}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Row({ name, score, win }: { name: string; score: string; win?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 text-sm ${
        win ? "bg-[rgba(212,175,55,0.12)] text-[var(--titans-gold)] font-bold" : ""
      }`}
    >
      <span className="truncate pr-2">{name}</span>
      <span className="font-mono">{score}</span>
    </div>
  );
}
