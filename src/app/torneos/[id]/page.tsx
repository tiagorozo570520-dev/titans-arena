"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import type { TournamentStatus } from "@/lib/types";
import { computeStandings } from "@/lib/engine";
import Bracket from "@/components/Bracket";

const statusMap: Record<TournamentStatus, { label: string; class: string }> = {
  open: { label: "INSCRIPCIONES ABIERTAS", class: "badge-open" },
  soon: { label: "PRÓXIMAMENTE", class: "badge-soon" },
  live: { label: "EN CURSO", class: "badge-live" },
  finished: { label: "FINALIZADO", class: "badge-finished" },
};

export default function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    tournaments,
    teams,
    enrollments,
    currentUser,
    isLoggedIn,
    enrollInTournament,
    matches,
    players,
  } = useApp();

  const tournament = tournaments.find((t) => t.id === id);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showRules, setShowRules] = useState(false);

  if (!tournament) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Torneo no encontrado</h1>
        <Link href="/torneos" className="btn-titans-outline">
          Volver a torneos
        </Link>
      </div>
    );
  }

  const status = statusMap[tournament.status];
  const myEnrollment = currentUser
    ? enrollments.find((e) => e.tournamentId === id && e.playerId === currentUser.id)
    : null;
  const availableTeams = teams.filter((t) => tournament.availableTeams.includes(t.id));
  const takenTeamIds = enrollments
    .filter((e) => e.tournamentId === id && e.teamId)
    .map((e) => e.teamId!);

  const handleEnroll = () => {
    if (!isLoggedIn) {
      setMessage({ type: "error", text: "Debes iniciar sesión para inscribirte" });
      return;
    }
    if (tournament.useTeams && !selectedTeam) {
      setMessage({ type: "error", text: "Selecciona un equipo" });
      return;
    }
    const result = enrollInTournament(id, selectedTeam || undefined);
    setMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div
        className="relative h-48 md:h-64 bg-cover bg-center"
        style={{
          background: tournament.image
            ? undefined
            : tournament.primaryColor
            ? `linear-gradient(135deg, ${tournament.primaryColor} 0%, #050508 100%)`
            : "linear-gradient(135deg, #1a1b25 0%, #050508 100%)",
          backgroundImage: tournament.image ? `url(${tournament.image})` : undefined,
        }}
      >
        {!tournament.image && (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span className="text-8xl">🏆</span>
          </div>
        )}
        {tournament.logo && (
          <div className="absolute bottom-6 left-4 md:left-8 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg bg-black/50 z-10">
            <img src={tournament.logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--titans-black)] to-transparent h-24" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 pb-16">
        <div className="titans-card p-6 md:p-8 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <span className={`badge ${status.class} mb-3`}>{status.label}</span>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
                {tournament.name}
              </h1>
              {tournament.subtitle && (
                <p className="text-[var(--titans-muted)] mt-1">{tournament.subtitle}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-gold">{tournament.prize}</div>
              <div className="text-xs text-[var(--titans-muted)]">PREMIO</div>
            </div>
          </div>

          <p className="text-sm text-[var(--titans-muted)] leading-relaxed mb-6">
            {tournament.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xl font-bold">
                {tournament.currentPlayers}/{tournament.maxPlayers}
              </div>
              <div className="text-[10px] text-[var(--titans-muted)] uppercase">Participantes</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xl font-bold capitalize">
                {tournament.format.replace(/_/g, " ")}
              </div>
              <div className="text-[10px] text-[var(--titans-muted)] uppercase">Formato</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xl font-bold">{tournament.platform}</div>
              <div className="text-[10px] text-[var(--titans-muted)] uppercase">Plataforma</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xl font-bold">
                {new Date(tournament.startDate).toLocaleDateString("es", {
                  day: "2-digit",
                  month: "short",
                })}
              </div>
              <div className="text-[10px] text-[var(--titans-muted)] uppercase">Inicio</div>
            </div>
          </div>

          {/* Rules toggle */}
          <button
            onClick={() => setShowRules(!showRules)}
            className="text-sm text-[var(--titans-blue)] hover:underline mb-4"
          >
            {showRules ? "Ocultar reglas ▲" : "Ver reglas y requisitos ▼"}
          </button>
          {showRules && (
            <div className="bg-white/5 rounded-xl p-4 text-sm text-[var(--titans-muted)] mb-6 whitespace-pre-line">
              {tournament.rules}
            </div>
          )}

          {/* Enrollment */}
          {myEnrollment ? (
            <div className="bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">✓</div>
              <div className="font-bold text-[var(--titans-success)] text-lg">
                INSCRIPCIÓN CONFIRMADA
              </div>
              <div className="text-sm text-[var(--titans-muted)] mt-1">
                Posición #{myEnrollment.position} en el torneo
                {myEnrollment.teamId && (
                  <> · Equipo: {teams.find((t) => t.id === myEnrollment.teamId)?.name}</>
                )}
              </div>
            </div>
          ) : tournament.status === "open" ? (
            <div className="space-y-4">
              {tournament.useTeams && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-[var(--titans-gold)]">
                    ⚽ Elige tu equipo
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                    {availableTeams.map((team) => {
                      const taken = takenTeamIds.includes(team.id);
                      return (
                        <button
                          key={team.id}
                          disabled={taken}
                          onClick={() => setSelectedTeam(team.id)}
                          className={`p-3 rounded-xl border text-left transition text-sm ${
                            selectedTeam === team.id
                              ? "border-[var(--titans-gold)] bg-[rgba(212,175,55,0.15)]"
                              : taken
                              ? "border-white/5 opacity-40 cursor-not-allowed"
                              : "border-white/10 hover:border-white/25 bg-white/5"
                          }`}
                        >
                          <div className="font-semibold truncate">{team.name}</div>
                          <div className="text-[10px] text-[var(--titans-muted)]">
                            {team.country} · {taken ? "🔴 Ocupado" : "🟢 Disponible"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {message && (
                <div
                  className={`p-3 rounded-lg text-sm text-center ${
                    message.type === "success"
                      ? "bg-[rgba(34,197,94,0.15)] text-[var(--titans-success)]"
                      : "bg-[rgba(239,68,68,0.15)] text-[var(--titans-danger)]"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button onClick={handleEnroll} className="btn-titans w-full">
                INSCRIBIRME
              </button>
              {!isLoggedIn && (
                <p className="text-xs text-center text-[var(--titans-muted)]">
                  <Link href="/login" className="text-[var(--titans-blue)] hover:underline">
                    Inicia sesión
                  </Link>{" "}
                  o{" "}
                  <Link href="/registro" className="text-[var(--titans-blue)] hover:underline">
                    regístrate
                  </Link>{" "}
                  para participar
                </p>
              )}
            </div>
          ) : (
            <div className="text-center text-[var(--titans-muted)] text-sm py-4">
              Las inscripciones no están abiertas para este torneo.
            </div>
          )}
        </div>

        {(() => {
          const tMatches = matches.filter((m) => m.tournamentId === id);
          const league = tMatches.filter((m) => m.round === "Fase Liga" || m.round.startsWith("Grupo"));
          const ids = Array.from(new Set(league.flatMap((m) => [m.playerAId, m.playerBId])));
          const table = ids.length ? computeStandings(ids, league) : [];
          const nameOf = (pid: string) => players.find((p) => p.id === pid)?.gamertag || pid;
          return (
            <div className="mt-10 space-y-8">
              {table.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-gold mb-3">TABLA</h2>
                  <div className="overflow-x-auto titans-card">
                    <table className="titans-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Jugador</th>
                          <th>PJ</th>
                          <th>Pts</th>
                          <th>DG</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.map((s, i) => (
                          <tr key={s.playerId}>
                            <td className="text-[var(--titans-gold)]">{i + 1}</td>
                            <td>{nameOf(s.playerId)}</td>
                            <td>{s.played}</td>
                            <td className="font-bold">{s.points}</td>
                            <td>{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {tournament.format === "champions" && (
                    <p className="text-[10px] text-[var(--titans-muted)] mt-2">
                      1-8 octavos directo · 9-24 playoff · 25-36 fuera
                    </p>
                  )}
                </div>
              )}
              <Bracket matches={tMatches} players={players} />
              {tMatches.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-gold mb-3">PARTIDOS</h2>
                  <div className="space-y-2">
                    {tMatches.map((m) => (
                      <div key={m.id} className="titans-card px-4 py-3 flex justify-between text-sm gap-3">
                        <span className="text-[10px] text-[var(--titans-blue)] shrink-0">{m.round}</span>
                        <span className="flex-1 text-center font-semibold">
                          {nameOf(m.playerAId)} {m.scoreA ?? "-"} : {m.scoreB ?? "-"} {nameOf(m.playerBId)}
                        </span>
                        <span className="text-[10px] text-[var(--titans-muted)]">{m.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        <Link href="/torneos" className="text-sm text-[var(--titans-muted)] hover:text-white transition mt-8 inline-block">
          ← Volver a torneos
        </Link>
      </div>
    </div>
  );
}
