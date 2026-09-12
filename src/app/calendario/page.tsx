"use client";

import { useApp } from "@/context/AppContext";
import { buildMatchMessage, buildWhatsAppChatUrl } from "@/lib/whatsapp";

export default function CalendarioPage() {
  const { matches, tournaments, players, currentUser } = useApp();

  const upcoming = matches
    .filter((m) => m.status === "pending")
    .sort((a, b) => (a.scheduledAt || "").localeCompare(b.scheduledAt || ""));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
          📅 <span className="text-gold">CALENDARIO</span>
        </h1>
        <p className="text-[var(--titans-muted)] text-sm">
          Próximos partidos y fechas importantes
        </p>
      </div>

      <h2 className="font-bold mb-4 text-sm uppercase tracking-wide text-[var(--titans-gold)]">
        Partidos pendientes
      </h2>

      {upcoming.length === 0 ? (
        <div className="titans-card p-8 text-center text-[var(--titans-muted)]">
          No hay partidos programados actualmente.
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.map((m) => {
            const pA = players.find((p) => p.id === m.playerAId);
            const pB = players.find((p) => p.id === m.playerBId);
            const tourney = tournaments.find((t) => t.id === m.tournamentId);
            return (
              <div key={m.id} className="titans-card p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-[var(--titans-blue)] font-semibold">
                    {tourney?.name}
                  </span>
                  <span className="text-xs text-[var(--titans-muted)]">{m.round}</span>
                </div>
                <div className="flex items-center justify-center gap-4 text-center">
                  <div className="flex-1">
                    <div className="font-bold">{pA?.gamertag || "TBD"}</div>
                  </div>
                  <div className="text-[var(--titans-muted)] font-black">VS</div>
                  <div className="flex-1">
                    <div className="font-bold">{pB?.gamertag || "TBD"}</div>
                  </div>
                </div>
                {m.scheduledAt && (
                  <div className="text-center text-xs text-[var(--titans-muted)] mt-2">
                    {new Date(m.scheduledAt).toLocaleString("es", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                )}
                {currentUser && (() => {
                  const rivalId = m.playerAId === currentUser.id ? m.playerBId : m.playerAId === currentUser.id ? m.playerBId : (m.playerBId === currentUser.id ? m.playerAId : null);
                  if (!rivalId || (m.playerAId !== currentUser.id && m.playerBId !== currentUser.id)) return null;
                  const rival = players.find((p) => p.id === rivalId);
                  if (!rival?.phone) return (
                    <p className="text-center text-[10px] text-[var(--titans-muted)] mt-2">Rival sin WhatsApp registrado</p>
                  );
                  const msg = buildMatchMessage({
                    myGamertag: currentUser.gamertag,
                    rivalGamertag: rival.gamertag,
                    tournamentName: tourney?.name || "Torneo TITANS",
                    round: m.round,
                    scheduledAt: m.scheduledAt,
                  });
                  const url = buildWhatsAppChatUrl(rival.phone, msg);
                  if (!url) return null;
                  return (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-[rgba(37,211,102,0.15)] text-[#25D366] border border-[rgba(37,211,102,0.35)] hover:bg-[rgba(37,211,102,0.25)] transition"
                    >
                      💬 Escribir a {rival.gamertag} por WhatsApp
                    </a>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}

      <h2 className="font-bold mb-4 mt-10 text-sm uppercase tracking-wide text-[var(--titans-gold)]">
        Torneos
      </h2>
      <div className="space-y-2">
        {tournaments
          .filter((t) => t.status !== "finished")
          .map((t) => (
            <div key={t.id} className="titans-card px-4 py-3 flex justify-between items-center">
              <div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs text-[var(--titans-muted)]">
                  {t.startDate} → {t.endDate}
                </div>
              </div>
              <span className="text-xs capitalize text-[var(--titans-blue)]">{t.status}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
