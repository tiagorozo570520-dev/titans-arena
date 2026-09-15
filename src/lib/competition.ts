import type { CompetitionPhase, FormatType, Match, Tournament } from "@/lib/types";

export type PhaseAction = "wait" | "continue" | "finish" | "draw";

export type PhaseDef = {
  id: CompetitionPhase;
  label: string;
  /** Subcadenas de Match.round que pertenecen a esta fase. */
  roundHints: string[];
  isTerminal: boolean;
};

export type FormatContract = {
  formats: FormatType[];
  label: string;
  initialPhase: CompetitionPhase;
  phases: CompetitionPhase[];
  /** Champions-8 NO es RR: league = 8 partidos/jugador (engine actual). */
  notes: string;
};

const PHASES: Record<CompetitionPhase, PhaseDef> = {
  draw: { id: "draw", label: "Distribución", roundHints: [], isTerminal: false },
  league: {
    id: "league",
    label: "Liga / Fase liga",
    roundHints: ["Fase Liga", "Liga", "Jornada"],
    isTerminal: false,
  },
  group: {
    id: "group",
    label: "Fase de grupos",
    roundHints: ["Grupo"],
    isTerminal: false,
  },
  r32: { id: "r32", label: "Dieciseisavos", roundHints: ["R32", "Dieciseisavos"], isTerminal: false },
  r16: { id: "r16", label: "Octavos", roundHints: ["Octavos", "Ronda 1"], isTerminal: false },
  qf: { id: "qf", label: "Cuartos", roundHints: ["Cuartos"], isTerminal: false },
  sf: { id: "sf", label: "Semis", roundHints: ["Semis", "Semifinal"], isTerminal: false },
  final: { id: "final", label: "Final", roundHints: ["Final"], isTerminal: false },
  done: { id: "done", label: "Finalizado", roundHints: [], isTerminal: true },
};

const CONTRACTS: FormatContract[] = [
  {
    formats: ["liga"],
    label: "Liga todos contra todos",
    initialPhase: "league",
    phases: ["league", "done"],
    notes: "RR completo (4.1). Campeón solo al cerrar league.",
  },
  {
    formats: ["mundial", "grupos_eliminacion"],
    label: "Mundial / grupos + KO",
    initialPhase: "group",
    phases: ["draw", "group", "r16", "qf", "sf", "final", "done"],
    notes: "8 grupos típicos. Champions-8 no usa este contrato.",
  },
  {
    formats: ["champions"],
    label: "Champions-8",
    initialPhase: "league",
    phases: ["league", "r16", "qf", "sf", "final", "done"],
    notes: "Envuelve buildLeaguePairs + advanceRound existentes. No convertir a RR.",
  },
  {
    formats: ["eliminacion_directa", "ida_vuelta", "copa", "2vs2", "relampago"],
    label: "Copa / KO",
    initialPhase: "r16",
    phases: ["r16", "qf", "sf", "final", "done"],
    notes: "Ronda 1 actual se mapea a r16.",
  },
  {
    formats: ["partido_unico"],
    label: "Partido único",
    initialPhase: "final",
    phases: ["final", "done"],
    notes: "Una final; campeón al confirmar.",
  },
];

export function getPhaseDef(phase: CompetitionPhase): PhaseDef {
  return PHASES[phase];
}

export function getFormatContract(format: FormatType): FormatContract {
  const found = CONTRACTS.find((c) => c.formats.includes(format));
  return (
    found || {
      formats: [format],
      label: format,
      initialPhase: "r16",
      phases: ["r16", "qf", "sf", "final", "done"],
      notes: "Contrato por defecto KO.",
    }
  );
}

export function nextPhase(format: FormatType, current: CompetitionPhase): CompetitionPhase | null {
  const c = getFormatContract(format);
  const i = c.phases.indexOf(current);
  if (i < 0) return c.phases[0] || null;
  return c.phases[i + 1] || null;
}

export function isLastCompetitivePhase(format: FormatType, current: CompetitionPhase): boolean {
  const nxt = nextPhase(format, current);
  return nxt === "done" || nxt === null;
}

export function matchesForPhase(phase: CompetitionPhase, matches: Match[]): Match[] {
  const hints = PHASES[phase].roundHints;
  if (!hints.length) return [];
  return matches.filter((m) => hints.some((h) => m.round.includes(h)));
}

export function phaseAlreadyGenerated(phase: CompetitionPhase, matches: Match[]): boolean {
  return matchesForPhase(phase, matches).length > 0;
}

/** Completa si hay partidos de la fase y todos los no-voided están confirmed. */
export function isPhaseComplete(phase: CompetitionPhase, matches: Match[]): boolean {
  if (phase === "done" || phase === "draw") return false;
  const list = matchesForPhase(phase, matches).filter((m) => m.status !== "voided");
  if (!list.length) return false;
  return list.every((m) => m.status === "confirmed");
}

export function phaseAction(format: FormatType, phase: CompetitionPhase, matches: Match[]): PhaseAction {
  if (phase === "draw") return "draw";
  if (phase === "done") return "finish";
  if (!isPhaseComplete(phase, matches)) return "wait";
  const nxt = nextPhase(format, phase);
  if (!nxt || nxt === "done") return "finish";
  return "continue";
}

/** Inferencia si current_phase no está persistido (torneos pre-4.0). */
export function inferPhase(t: Tournament, matches: Match[]): CompetitionPhase {
  if (t.currentPhase) return t.currentPhase;
  if (t.status === "finished") return "done";
  if (t.status === "open" || t.status === "soon") {
    const c = getFormatContract(t.format);
    return c.phases.includes("draw") ? "draw" : c.initialPhase;
  }
  const order: CompetitionPhase[] = ["final", "sf", "qf", "r16", "r32", "group", "league"];
  for (const p of order) {
    if (phaseAlreadyGenerated(p, matches)) return p;
  }
  return getFormatContract(t.format).initialPhase;
}

export function assertNoStuckRoute(format: FormatType): string[] {
  const c = getFormatContract(format);
  const errors: string[] = [];
  if (!c.phases.includes("done")) errors.push(`${format}: falta done`);
  const last = c.phases[c.phases.length - 1];
  if (last !== "done") errors.push(`${format}: última fase no es done`);
  c.phases.forEach((p, i) => {
    if (p === "done") return;
    const nxt = c.phases[i + 1];
    if (!nxt) errors.push(`${format}: ${p} sin siguiente`);
  });
  return errors;
}

export const ALL_FORMATS: FormatType[] = [
  "liga",
  "grupos_eliminacion",
  "eliminacion_directa",
  "ida_vuelta",
  "partido_unico",
  "mundial",
  "champions",
  "copa",
  "2vs2",
  "relampago",
];
