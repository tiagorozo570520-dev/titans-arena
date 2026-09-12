"use client";

import { useApp } from "@/context/AppContext";
import { getWinRate } from "@/data/mock";

export default function JugadoresPage() {
  const { players } = useApp();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
          👤 <span className="text-gold">JUGADORES</span>
        </h1>
        <p className="text-[var(--titans-muted)] text-sm">
          {players.length} guerreros registrados en TITANS ARENA
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((p) => (
          <div key={p.id} className="titans-card p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--titans-gold)] to-[var(--titans-blue)] flex items-center justify-center text-lg font-bold text-black shrink-0">
              {p.gamertag.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{p.gamertag}</div>
              <div className="text-[10px] text-[var(--titans-muted)] font-mono">{p.titansId}</div>
              <div className="flex flex-wrap gap-x-2 text-xs text-[var(--titans-muted)] mt-1">
                <span>{p.platform}</span>
                <span>·</span>
                <span>{p.country}</span>
              </div>
              <div className="text-xs mt-1">
                <span className="text-gold font-semibold">{p.points} pts</span>
                <span className="text-[var(--titans-muted)]"> · {p.rank} · {getWinRate(p)}% WR</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
