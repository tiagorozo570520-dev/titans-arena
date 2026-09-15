"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { enrolledCount } from "@/lib/enrollCount";
import type { FormatType, Platform, TournamentStatus } from "@/lib/types";
import { fileToDataUrl } from "@/lib/images";

const TEMPLATES: {
  id: string;
  label: string;
  name: string;
  subtitle: string;
  description: string;
  prize: string;
  maxPlayers: number;
  format: FormatType;
  useTeams: boolean;
  twoLegs: boolean;
  status: TournamentStatus;
  rules: string;
}[] = [
  {
    id: "ucl",
    label: "Champions League",
    name: "UEFA CHAMPIONS LEAGUE TITANS",
    subtitle: "Fase de liga + eliminación",
    description: "36 clubes. Liga y luego knockout ida y vuelta hasta la final a partido único.",
    prize: "Campeón de Europa TITANS",
    maxPlayers: 36,
    format: "champions",
    useTeams: true,
    twoLegs: true,
    status: "open",
    rules: "36 equipos. Fase liga. Octavos, cuartos y semis ida y vuelta. Final a un partido.",
  },
  {
    id: "mundial",
    label: "Mundial",
    name: "MUNDIAL TITANS",
    subtitle: "8 grupos + knockout",
    description: "32 selecciones. Grupos de 4 y eliminación directa desde octavos.",
    prize: "Campeón del Mundo TITANS",
    maxPlayers: 32,
    format: "mundial",
    useTeams: true,
    twoLegs: false,
    status: "open",
    rules: "8 grupos de 4. Pasan 1° y 2°. Octavos a final a un partido.",
  },
  {
    id: "uel",
    label: "Europa League",
    name: "EUROPA LEAGUE TITANS",
    subtitle: "Fase liga + knockout",
    description: "36 clubes. Mismo espíritu UEL.",
    prize: "Campeón Europa League TITANS",
    maxPlayers: 36,
    format: "champions",
    useTeams: true,
    twoLegs: true,
    status: "open",
    rules: "Fase liga y eliminación ida y vuelta. Final a un partido.",
  },
  {
    id: "copa",
    label: "Copa",
    name: "COPA TITANS",
    subtitle: "Eliminación directa",
    description: "16 equipos. Solo knockout.",
    prize: "Campeón Copa TITANS",
    maxPlayers: 16,
    format: "copa",
    useTeams: true,
    twoLegs: true,
    status: "open",
    rules: "Eliminación ida y vuelta. Final a un partido.",
  },
  {
    id: "relampago",
    label: "Relámpago",
    name: "TORNEO RELÁMPAGO TITANS",
    subtitle: "Un día",
    description: "8 jugadores. Partido único cada cruce.",
    prize: "Campeón Relámpago",
    maxPlayers: 8,
    format: "relampago",
    useTeams: false,
    twoLegs: false,
    status: "open",
    rules: "Cuartos, semi y final a un partido el mismo día.",
  },
  {
    id: "custom",
    label: "Personalizado",
    name: "",
    subtitle: "",
    description: "",
    prize: "",
    maxPlayers: 16,
    format: "eliminacion_directa",
    useTeams: false,
    twoLegs: false,
    status: "open",
    rules: "",
  },
];

export default function AdminPage() {
  const {
    currentUser,
    isLoggedIn,
    players,
    tournaments,
    matches,
    teams,
    enrollments,
    createTournament,
    addTeam,
    updateTeam,
    generateFixtures,
    advanceRound,
    finishTournament,
    resetAllData,
    updatePlayer,
    confirmResult,
    adminCorrectResult,
    adminReopenMatch,
    adminVoidMatch,
  } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "create" | "teams" | "results">("overview");
  const [editScore, setEditScore] = useState<Record<string, { a: string; b: string }>>({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!isLoggedIn || !currentUser?.isAdmin) {
      router.push("/login");
    }
  }, [isLoggedIn, currentUser, router]);

  const [form, setForm] = useState({
    name: "",
    subtitle: "",
    description: "",
    prize: "",
    maxPlayers: 16,
    platform: "Crossplay" as Platform,
    format: "eliminacion_directa" as FormatType,
    rules: "",
    status: "open" as TournamentStatus,
    useTeams: false,
    twoLegs: false,
    groupCount: 0,
    qualifyPerGroup: 2,
    startDate: "",
    endDate: "",
    image: "" as string,
    logo: "" as string,
  });
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [imgError, setImgError] = useState("");

  const [teamForm, setTeamForm] = useState({
    name: "",
    shortName: "",
    country: "",
    league: "",
    primaryColor: "#FFFFFF",
    secondaryColor: "#000000",
    logo: "" as string,
  });

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-[var(--titans-muted)]">
        Acceso restringido
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTournament({
      ...form,
      legs: form.twoLegs ? 2 : 1,
      availableTeams: form.useTeams
        ? selectedTeams.length
          ? selectedTeams
          : teams.map((t) => t.id)
        : [],
    });
    setSelectedTeams([]);
    setMsg("¡Torneo creado exitosamente!");
    setForm({
      name: "",
      subtitle: "",
      description: "",
      prize: "",
      maxPlayers: 16,
      platform: "Crossplay",
      format: "eliminacion_directa",
      rules: "",
      status: "open",
      useTeams: false,
      twoLegs: false,
      groupCount: 0,
      qualifyPerGroup: 2,
      startDate: "",
      endDate: "",
      image: "",
      logo: "",
    });
    setImgError("");
    setTab("overview");
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    addTeam({ ...teamForm, active: true });
    setMsg("¡Equipo agregado!");
    setTeamForm({
      name: "",
      shortName: "",
      country: "",
      league: "",
      primaryColor: "#FFFFFF",
      secondaryColor: "#000000",
      logo: "",
    });
  };

  const pendingResults = matches.filter((m) => m.status === "reported" || m.status === "disputed");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-black mb-2">
        ⚙️ <span className="text-gold">PANEL ADMIN</span>
      </h1>
      <p className="text-sm text-[var(--titans-muted)] mb-8">
        Gestión de TITANS ARENA
      </p>

      {msg && (
        <div className="bg-[rgba(34,197,94,0.15)] text-[var(--titans-success)] text-sm p-3 rounded-lg mb-6 text-center">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { key: "overview" as const, label: "Resumen" },
          { key: "create" as const, label: "+ Crear Torneo" },
          { key: "teams" as const, label: "Equipos" },
          { key: "results" as const, label: "Resultados" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
              tab === t.key
                ? "bg-[var(--titans-gold)] text-black"
                : "bg-white/5 text-[var(--titans-muted)] hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Jugadores", value: players.length, icon: "👤" },
              { label: "Torneos", value: tournaments.length, icon: "🏆" },
              { label: "Activos", value: tournaments.filter((t) => t.status === "live" || t.status === "open").length, icon: "🔴" },
              { label: "Disputas/Pendientes", value: pendingResults.length, icon: "🚨" },
            ].map((s) => (
              <div key={s.label} className="titans-card p-5 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-black text-gold">{s.value}</div>
                <div className="text-[10px] text-[var(--titans-muted)] uppercase">{s.label}</div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm("Esto borra jugadores, torneos e inscripciones de ESTE navegador. ¿Seguro?")) {
                resetAllData();
                setMsg("Datos reiniciados. Vuelve a entrar como admin.");
              }
            }}
            className="text-xs text-[var(--titans-danger)] hover:underline"
          >
            Reiniciar plataforma (borrar datos locales)
          </button>

          <div>
            <h2 className="font-bold mb-3">Staff / Administradores</h2>
            <p className="text-xs text-[var(--titans-muted)] mb-3">
              Elige jugadores registrados y dales acceso al panel Admin.
            </p>
            <div className="space-y-2">
              {players.map((p) => (
                <div key={p.id} className="titans-card px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{p.gamertag}</div>
                    <div className="text-[10px] text-[var(--titans-muted)] truncate">
                      {p.email} · {p.titansId}
                    </div>
                  </div>
                  {p.isAdmin ? (
                    <button
                      type="button"
                      disabled={p.id === currentUser.id}
                      onClick={() => updatePlayer(p.id, { isAdmin: false })}
                      className="text-[10px] text-[var(--titans-danger)] hover:underline disabled:opacity-40"
                    >
                      Quitar admin
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updatePlayer(p.id, { isAdmin: true })}
                      className="btn-titans-outline !py-1.5 !px-3 !text-[10px]"
                    >
                      Hacer admin
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold mb-3">Torneos recientes</h2>
            <div className="space-y-2">
              {tournaments.slice(0, 5).map((t) => (
                <div key={t.id} className="titans-card px-4 py-3 flex justify-between items-center gap-3">
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-[var(--titans-muted)]">
                      {enrolledCount(t.id, enrollments)}/{t.maxPlayers} · {t.status}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-titans-outline !py-1.5 !px-3 !text-[10px] shrink-0"
                    onClick={async () => {
                      const r = await generateFixtures(t.id);
                      setMsg(r.message);
                    }}
                  >
                    Generar partidos
                  </button>
                  <button
                    type="button"
                    className="btn-titans-outline !py-1.5 !px-3 !text-[10px] shrink-0"
                    onClick={() => setMsg(advanceRound(t.id).message)}
                  >
                    Siguiente ronda
                  </button>
                  <button
                    type="button"
                    className="btn-titans !py-1.5 !px-3 !text-[10px] shrink-0"
                    onClick={() => {
                      if (confirm("¿Finalizar y coronar campeón?")) setMsg(finishTournament(t.id).message);
                    }}
                  >
                    Finalizar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "results" && (
        <div className="space-y-3">
          <h2 className="font-bold text-gold">Control de resultados</h2>
          <p className="text-xs text-[var(--titans-muted)]">
            Corregir, reabrir, anular o confirmar. Las tablas se recalculan solo con partidos confirmados.
          </p>
          {matches.length === 0 && (
            <p className="text-sm text-[var(--titans-muted)]">No hay partidos.</p>
          )}
          {matches.map((m) => {
            const a = players.find((p) => p.id === m.playerAId)?.gamertag || m.playerAId;
            const b = players.find((p) => p.id === m.playerBId)?.gamertag || m.playerBId;
            const tour = tournaments.find((t) => t.id === m.tournamentId)?.name || m.tournamentId;
            const draft = editScore[m.id] || { a: String(m.scoreA ?? ""), b: String(m.scoreB ?? "") };
            return (
              <div key={m.id} className="titans-card p-4 space-y-2">
                <div className="flex justify-between gap-2 text-xs">
                  <span className="text-[var(--titans-muted)] truncate">{tour} · {m.round}</span>
                  <span className="uppercase font-semibold text-gold">{m.status}</span>
                </div>
                <div className="font-semibold text-sm">
                  {a} {m.scoreA ?? "-"} : {m.scoreB ?? "-"} {b}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    className="w-14 bg-white/5 rounded px-2 py-1 text-sm"
                    value={draft.a}
                    onChange={(e) => setEditScore((s) => ({ ...s, [m.id]: { ...draft, a: e.target.value } }))}
                  />
                  <span className="text-[var(--titans-muted)]">-</span>
                  <input
                    type="number"
                    min={0}
                    className="w-14 bg-white/5 rounded px-2 py-1 text-sm"
                    value={draft.b}
                    onChange={(e) => setEditScore((s) => ({ ...s, [m.id]: { ...draft, b: e.target.value } }))}
                  />
                  <button
                    type="button"
                    className="btn-titans !py-1 !px-2 !text-[10px]"
                    onClick={async () => {
                      const r = await adminCorrectResult(m.id, parseInt(draft.a, 10), parseInt(draft.b, 10));
                      setMsg(r.message);
                    }}
                  >
                    Corregir
                  </button>
                  {m.status === "reported" || m.status === "disputed" ? (
                    <button
                      type="button"
                      className="btn-titans-outline !py-1 !px-2 !text-[10px]"
                      onClick={async () => setMsg((await confirmResult(m.id)).message)}
                    >
                      Confirmar
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="btn-titans-outline !py-1 !px-2 !text-[10px]"
                    onClick={async () => setMsg((await adminReopenMatch(m.id)).message)}
                  >
                    Reabrir
                  </button>
                  <button
                    type="button"
                    className="text-[10px] text-[var(--titans-danger)]"
                    onClick={async () => setMsg((await adminVoidMatch(m.id)).message)}
                  >
                    Anular
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "create" && (
        <form onSubmit={handleCreate} className="titans-card p-6 space-y-4 max-w-2xl">
          <h2 className="font-bold text-lg text-gold mb-2">Crear Torneo Temático</h2>
          <p className="text-xs text-[var(--titans-muted)] mb-4">
            Elige una plantilla (Champions, Mundial…) y solo sube banner y logo. O arma una personalizada.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    name: tpl.name || prev.name,
                    subtitle: tpl.subtitle,
                    description: tpl.description,
                    prize: tpl.prize,
                    maxPlayers: tpl.maxPlayers,
                    format: tpl.format,
                    useTeams: tpl.useTeams,
                    twoLegs: tpl.twoLegs,
                    status: tpl.status,
                    rules: tpl.rules,
                  }));
                  if (tpl.useTeams) setSelectedTeams(teams.map((x) => x.id));
                  else setSelectedTeams([]);
                }}
                className="px-3 py-2 rounded-xl text-[11px] font-bold border border-white/10 bg-white/5 hover:border-[var(--titans-gold)] hover:text-[var(--titans-gold)] transition"
              >
                {tpl.label}
              </button>
            ))}
          </div>

          <input
            placeholder="Nombre del torneo (ej: UEFA CHAMPIONS LEAGUE TITANS)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)]"
            required
          />
          <input
            placeholder="Subtítulo"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)]"
          />
          <textarea
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)] h-24"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Premio"
              value={form.prize}
              onChange={(e) => setForm({ ...form, prize: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)]"
            />
            <input
              type="number"
              placeholder="Máx jugadores"
              value={form.maxPlayers}
              onChange={(e) => setForm({ ...form, maxPlayers: Number(e.target.value) })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value as FormatType })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)]"
            >
              <option value="liga">Liga</option>
              <option value="grupos_eliminacion">Grupos + Eliminación</option>
              <option value="eliminacion_directa">Eliminación Directa</option>
              <option value="champions">Champions</option>
              <option value="copa">Copa</option>
              <option value="relampago">Relámpago</option>
              <option value="2vs2">2 vs 2</option>
              <option value="mundial">Mundial</option>
            </select>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as TournamentStatus })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)]"
            >
              <option value="soon">Próximamente</option>
              <option value="open">Inscripciones Abiertas</option>
              <option value="live">En Curso</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)]"
            />
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)]"
            />
          </div>
          <textarea
            placeholder="Reglas"
            value={form.rules}
            onChange={(e) => setForm({ ...form, rules: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)] h-20"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--titans-muted)] uppercase mb-1.5">
                🖼️ Banner / imagen del torneo
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    setImgError("");
                    const url = await fileToDataUrl(f);
                    setForm((prev) => ({ ...prev, image: url }));
                  } catch (err: unknown) {
                    setImgError(err instanceof Error ? err.message : "Error al cargar imagen");
                  }
                }}
                className="w-full text-xs text-[var(--titans-muted)] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--titans-gold)] file:text-black file:font-semibold file:text-xs"
              />
              {form.image && (
                <div className="mt-2 h-20 rounded-lg bg-cover bg-center border border-white/10" style={{ backgroundImage: `url(${form.image})` }} />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--titans-muted)] uppercase mb-1.5">
                🏆 Logo del torneo
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    setImgError("");
                    const url = await fileToDataUrl(f);
                    setForm((prev) => ({ ...prev, logo: url }));
                  } catch (err: unknown) {
                    setImgError(err instanceof Error ? err.message : "Error al cargar logo");
                  }
                }}
                className="w-full text-xs text-[var(--titans-muted)] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--titans-gold)] file:text-black file:font-semibold file:text-xs"
              />
              {form.logo && (
                <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                  <img src={form.logo} alt="Logo preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
          {imgError && (
            <p className="text-xs text-[var(--titans-danger)]">{imgError}</p>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.useTeams}
              onChange={(e) => setForm({ ...form, useTeams: e.target.checked })}
              className="accent-[var(--titans-gold)]"
            />
            Utilizar equipos de la biblioteca
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.twoLegs}
              onChange={(e) => setForm({ ...form, twoLegs: e.target.checked })}
              className="accent-[var(--titans-gold)]"
            />
            Partidos de ida y vuelta
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[var(--titans-muted)] uppercase mb-1">Fase de grupos</label>
              <select
                value={form.groupCount}
                onChange={(e) => setForm({ ...form, groupCount: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
              >
                <option value={0}>Sin grupos (KO directo)</option>
                <option value={2}>2 grupos</option>
                <option value={3}>3 grupos</option>
                <option value={4}>4 grupos</option>
                <option value={5}>5 grupos</option>
                <option value={6}>6 grupos</option>
                <option value={8}>8 grupos</option>
              </select>
            </div>
            {form.groupCount >= 2 && (
              <div>
                <label className="block text-[10px] text-[var(--titans-muted)] uppercase mb-1">Clasifican por grupo</label>
                <select
                  value={form.qualifyPerGroup}
                  onChange={(e) => setForm({ ...form, qualifyPerGroup: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                >
                  <option value={1}>1° solamente</option>
                  <option value={2}>1° y 2°</option>
                </select>
              </div>
            )}
          </div>
          {form.twoLegs && (
            <p className="text-[10px] text-[var(--titans-muted)] -mt-1">
              Cada cruce serán 2 partidos. El marcador global decide quién avanza.
            </p>
          )}
          {form.useTeams && (
            <div className="max-h-40 overflow-y-auto grid grid-cols-2 gap-2">
              {teams.map((team) => (
                <label key={team.id} className="flex items-center gap-2 text-xs bg-white/5 rounded-lg px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={selectedTeams.includes(team.id)}
                    onChange={() =>
                      setSelectedTeams((prev) =>
                        prev.includes(team.id) ? prev.filter((id) => id !== team.id) : [...prev, team.id]
                      )
                    }
                    className="accent-[var(--titans-gold)]"
                  />
                  <span className="truncate">{team.name}</span>
                </label>
              ))}
              <p className="col-span-2 text-[10px] text-[var(--titans-muted)]">
                Si no marcas ninguno, se usan todos.
              </p>
            </div>
          )}
          <button type="submit" className="btn-titans w-full">
            CREAR TORNEO
          </button>
        </form>
      )}

      {tab === "teams" && (
        <div className="space-y-6">
          <form onSubmit={handleAddTeam} className="titans-card p-6 space-y-3 max-w-xl">
            <h2 className="font-bold text-lg text-gold">+ Agregar Equipo</h2>
            <input
              placeholder="Nombre (Real Madrid)"
              value={teamForm.name}
              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)]"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Abreviatura"
                value={teamForm.shortName}
                onChange={(e) => setTeamForm({ ...teamForm, shortName: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)]"
                required
              />
              <input
                placeholder="País"
                value={teamForm.country}
                onChange={(e) => setTeamForm({ ...teamForm, country: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)]"
              />
            </div>
            <input
              placeholder="Liga"
              value={teamForm.league}
              onChange={(e) => setTeamForm({ ...teamForm, league: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)]"
            />
            <div>
              <label className="block text-xs font-semibold text-[var(--titans-muted)] uppercase mb-1.5">
                ⚽ Escudo / logo del equipo
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    const url = await fileToDataUrl(f);
                    setTeamForm((prev) => ({ ...prev, logo: url }));
                  } catch (err: unknown) {
                    setMsg(err instanceof Error ? err.message : "Error imagen");
                  }
                }}
                className="w-full text-xs text-[var(--titans-muted)] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--titans-gold)] file:text-black file:font-semibold file:text-xs"
              />
              {teamForm.logo && (
                <div className="mt-2 w-14 h-14 rounded-lg overflow-hidden border border-white/10">
                  <img src={teamForm.logo} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <button type="submit" className="btn-titans w-full">
              AGREGAR EQUIPO
            </button>
          </form>

          <div>
            <h2 className="font-bold mb-3">Biblioteca de equipos ({teams.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {teams.map((tm) => (
                <div key={tm.id} className="titans-card p-3 text-sm flex items-center gap-2">
                  {tm.logo ? (
                    <img src={tm.logo} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs shrink-0">⚽</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{tm.name}</div>
                    <div className="text-[10px] text-[var(--titans-muted)]">
                      {tm.shortName} · {tm.country}
                    </div>
                    <label className="text-[10px] text-[var(--titans-blue)] cursor-pointer">
                      Subir escudo
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          try {
                            const url = await fileToDataUrl(f);
                            updateTeam(tm.id, { logo: url });
                            setMsg("Escudo de " + tm.name + " guardado");
                          } catch (err: unknown) {
                            setMsg(err instanceof Error ? err.message : "Error");
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
