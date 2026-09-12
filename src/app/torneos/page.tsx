"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import TournamentCard from "@/components/TournamentCard";
import type { TournamentStatus } from "@/lib/types";

const filters: { key: TournamentStatus | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "open", label: "Inscripciones" },
  { key: "live", label: "En curso" },
  { key: "soon", label: "Próximos" },
  { key: "finished", label: "Finalizados" },
];

export default function TorneosPage() {
  const { tournaments } = useApp();
  const [filter, setFilter] = useState<TournamentStatus | "all">("all");

  const filtered =
    filter === "all" ? tournaments : tournaments.filter((t) => t.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
          🏆 <span className="text-gold">TORNEOS</span>
        </h1>
        <p className="text-[var(--titans-muted)] text-sm">
          Compite en los mejores torneos de eFootball. Elige tu destino.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
              filter === f.key
                ? "bg-[var(--titans-gold)] text-black"
                : "bg-white/5 text-[var(--titans-muted)] hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="titans-card p-12 text-center text-[var(--titans-muted)]">
          No hay torneos en esta categoría.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </div>
  );
}
