"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getWinRate } from "@/data/mock";
import { buildMatchMessage, buildWhatsAppChatUrl, WHATSAPP_COMMUNITY_URL } from "@/lib/whatsapp";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PerfilPage() {
  const {
    currentUser,
    isLoggedIn,
    enrollments,
    tournaments,
    matches,
    players,
    updatePlayer,
    reportResult,
    confirmResult,
    disputeResult,
  } = useApp();
  const router = useRouter();
  const [phoneEdit, setPhoneEdit] = useState("");
  const [phoneMsg, setPhoneMsg] = useState("");
  const [scoreA, setScoreA] = useState<Record<string, string>>({});
  const [scoreB, setScoreB] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--titans-muted)]">Cargando...</div>
      </div>
    );
  }

  const myTournaments = enrollments
    .filter((e) => e.playerId === currentUser.id)
    .map((e) => tournaments.find((t) => t.id === e.tournamentId))
    .filter(Boolean);

  const myMatches = matches.filter(
    (m) => m.playerAId === currentUser.id || m.playerBId === currentUser.id
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black">
          BIENVENIDO, <span className="text-gold">{currentUser.gamertag}</span>
        </h1>
      </div>

      {/* Player card */}
      <div className="titans-card p-6 md:p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle,rgba(212,175,55,0.1)_0%,transparent_70%)]" />
        <div className="flex flex-col sm:flex-row items-center gap-6 relative">
          <div className="relative w-24 h-24 shrink-0">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.45)_0%,transparent_70%)] blur-md" />
            <div className="relative w-24 h-24 rounded-full bg-[#0a0b12] border border-[rgba(212,175,55,0.4)] flex items-center justify-center text-3xl font-black text-gold">
              {currentUser.gamertag.slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-2xl font-black">{currentUser.gamertag}</div>
            <div className="text-sm text-[var(--titans-blue)] font-mono">{currentUser.titansId}</div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2 text-xs text-[var(--titans-muted)]">
              <span>{currentUser.platform}</span>
              <span>·</span>
              <span>{currentUser.country}</span>
              <span>·</span>
              <span className="text-[var(--titans-gold)] font-semibold">{currentUser.rank}</span>
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2 items-center sm:items-end">
              <div className="w-full sm:w-56">
                <label className="block text-[10px] text-[var(--titans-muted)] uppercase mb-1">WhatsApp</label>
                <input
                  type="tel"
                  defaultValue={currentUser.phone || ""}
                  onChange={(e) => setPhoneEdit(e.target.value)}
                  placeholder="5215512345678"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[var(--titans-gold)]"
                />
              </div>
              <button
                type="button"
                className="btn-titans-outline !py-2 !px-3 !text-xs"
                onClick={() => {
                  const clean = (phoneEdit || currentUser.phone || "").replace(/\D/g, "");
                  if (clean && clean.length < 10) {
                    setPhoneMsg("Número inválido");
                    return;
                  }
                  updatePlayer(currentUser.id, { phone: clean });
                  setPhoneMsg("WhatsApp guardado");
                }}
              >
                Guardar
              </button>
            </div>
            {phoneMsg && <p className="text-[10px] text-[#25D366] mt-1">{phoneMsg}</p>}
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-gold">{currentUser.points}</div>
            <div className="text-xs text-[var(--titans-muted)] uppercase">Puntos TITANS</div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        {[
          { label: "PJ", value: currentUser.matches },
          { label: "PG", value: currentUser.wins },
          { label: "PE", value: currentUser.draws },
          { label: "PP", value: currentUser.losses },
          { label: "WR", value: `${getWinRate(currentUser)}%` },
          { label: "Títulos", value: currentUser.titles },
        ].map((s) => (
          <div key={s.label} className="titans-card p-4 text-center">
            <div className="text-xl font-black text-gold">{s.value}</div>
            <div className="text-[10px] text-[var(--titans-muted)] uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Trophies */}
      {currentUser.trophies.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3">🏅 Mis Trofeos</h2>
          <div className="flex flex-wrap gap-2">
            {currentUser.trophies.map((t) => (
              <span
                key={t}
                className="badge badge-finished !normal-case !tracking-normal"
              >
                🏆 {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* My tournaments */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3">🏆 Mis Torneos</h2>
        {myTournaments.length === 0 ? (
          <div className="titans-card p-6 text-center text-[var(--titans-muted)] text-sm">
            Aún no estás inscrito en ningún torneo.{" "}
            <Link href="/torneos" className="text-[var(--titans-blue)] hover:underline">
              Explorar torneos
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myTournaments.map((t) =>
              t ? (
                <Link
                  key={t.id}
                  href={`/torneos/${t.id}`}
                  className="titans-card px-4 py-3 flex items-center justify-between hover:border-[rgba(0,212,255,0.2)]"
                >
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-[var(--titans-muted)] capitalize">
                      {t.status} · {t.format.replace(/_/g, " ")}
                    </div>
                  </div>
                  <span className="text-[var(--titans-blue)] text-sm">Ver →</span>
                </Link>
              ) : null
            )}
          </div>
        )}
      </div>

      <a
        href={WHATSAPP_COMMUNITY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-8 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold bg-[rgba(37,211,102,0.15)] text-[#25D366] border border-[rgba(37,211,102,0.35)] hover:bg-[rgba(37,211,102,0.25)] transition"
      >
        💬 Unirme a la Comunidad WhatsApp TITANS
      </a>

      {/* Upcoming matches */}
      <div>
        <h2 className="text-lg font-bold mb-3">⚔️ Mis Partidos</h2>
        {myMatches.length === 0 ? (
          <div className="titans-card p-6 text-center text-[var(--titans-muted)] text-sm">
            No tienes partidos programados.
          </div>
        ) : (
          <div className="space-y-2">
            {myMatches.map((m) => {
              const rivalId = m.playerAId === currentUser.id ? m.playerBId : m.playerAId;
              const rival = players.find((p) => p.id === rivalId);
              const tourney = tournaments.find((t) => t.id === m.tournamentId);
              const waUrl =
                rival?.phone &&
                buildWhatsAppChatUrl(
                  rival.phone,
                  buildMatchMessage({
                    myGamertag: currentUser.gamertag,
                    rivalGamertag: rival.gamertag,
                    tournamentName: tourney?.name || "Torneo TITANS",
                    round: m.round,
                    scheduledAt: m.scheduledAt,
                  })
                );
              return (
              <div key={m.id} className="titans-card px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{m.round}</span>
                  <span
                    className={`badge ${
                      m.status === "confirmed"
                        ? "badge-open"
                        : m.status === "disputed"
                        ? "badge-live"
                        : "badge-soon"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <div className="text-center font-bold text-lg mt-1">
                  {m.scoreA !== undefined ? (
                    <>
                      {m.scoreA} - {m.scoreB}
                    </>
                  ) : (
                    <>vs {rival?.gamertag || "Rival"}</>
                  )}
                </div>
                {waUrl && m.status === "pending" && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-[rgba(37,211,102,0.15)] text-[#25D366] border border-[rgba(37,211,102,0.35)] hover:bg-[rgba(37,211,102,0.25)] transition"
                  >
                    💬 Contactar rival por WhatsApp
                  </a>
                )}
                {m.status === "reported" && m.reportedBy !== currentUser.id && (
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="btn-titans !py-1.5 !px-3 !text-[10px]" onClick={() => confirmResult(m.id)}>
                      Confirmar
                    </button>
                    <button type="button" className="btn-titans-outline !py-1.5 !px-3 !text-[10px]" onClick={() => disputeResult(m.id)}>
                      Disputar
                    </button>
                  </div>
                )}
                {m.status === "reported" && m.reportedBy === currentUser.id && (
                  <p className="text-[10px] text-center text-[var(--titans-muted)] mt-2">Esperando confirmación del rival</p>
                )}
                {m.status === "pending" && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="Tú"
                      value={scoreA[m.id] || ""}
                      onChange={(e) => setScoreA((s) => ({ ...s, [m.id]: e.target.value }))}
                      className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-center text-sm"
                    />
                    <span className="text-[var(--titans-muted)] text-xs">-</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="Rival"
                      value={scoreB[m.id] || ""}
                      onChange={(e) => setScoreB((s) => ({ ...s, [m.id]: e.target.value }))}
                      className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-center text-sm"
                    />
                    <button
                      type="button"
                      className="btn-titans !py-1.5 !px-3 !text-[10px]"
                      onClick={() => {
                        const a = Number(scoreA[m.id]);
                        const b = Number(scoreB[m.id]);
                        if (Number.isNaN(a) || Number.isNaN(b)) return;
                        const myIsA = m.playerAId === currentUser.id;
                        reportResult(m.id, myIsA ? a : b, myIsA ? b : a);
                      }}
                    >
                      Reportar
                    </button>
                  </div>
                )}
              </div>
            );})}
          </div>
        )}
      </div>
    </div>
  );
}
