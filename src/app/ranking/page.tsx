"use client";

import { useApp } from "@/context/AppContext";
import { getWinRate } from "@/data/mock";
import Link from "next/link";

export default function RankingPage() {
  const { players } = useApp();
  const ranked = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
          📊 <span className="text-gold">RANKING TITANS</span>
        </h1>
        <p className="text-[var(--titans-muted)] text-sm">
          Los mejores jugadores de la comunidad. Compite y sube.
        </p>
      </div>

      {/* Top 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {ranked.slice(0, 3).map((p, i) => (
          <div
            key={p.id}
            className={`titans-card p-6 text-center ${
              i === 0 ? "ring-1 ring-[var(--titans-gold)]/50 order-first sm:order-none sm:scale-105" : ""
            }`}
          >
            <div className="text-4xl mb-2">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</div>
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[var(--titans-gold)] to-[var(--titans-blue)] flex items-center justify-center text-xl font-bold text-black mb-3">
              {p.gamertag.slice(0, 2).toUpperCase()}
            </div>
            <div className="font-bold text-lg">{p.gamertag}</div>
            <div className="text-xs text-[var(--titans-muted)]">{p.titansId}</div>
            <div className="text-2xl font-black text-gold mt-2">{p.points}</div>
            <div className="text-xs text-[var(--titans-blue)] font-semibold">{p.rank}</div>
            <div className="text-xs text-[var(--titans-muted)] mt-1">
              {p.wins}V · {getWinRate(p)}% WR · {p.titles} títulos
            </div>
          </div>
        ))}
      </div>

      {/* Full table - cards on mobile */}
      <div className="space-y-2">
        {ranked.map((p, i) => (
          <div
            key={p.id}
            className="titans-card px-4 py-3 flex items-center gap-3 md:gap-4 hover:border-[rgba(0,212,255,0.2)]"
          >
            <div
              className={`w-8 text-center font-black text-sm ${
                i < 3 ? "text-gold" : "text-[var(--titans-muted)]"
              }`}
            >
              #{i + 1}
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--titans-gold)]/80 to-[var(--titans-blue)]/80 flex items-center justify-center text-xs font-bold text-black shrink-0">
              {p.gamertag.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{p.gamertag}</div>
              <div className="text-[10px] text-[var(--titans-muted)]">
                {p.titansId} · {p.platform} · {p.country}
              </div>
            </div>
            <div className="hidden sm:block text-xs text-[var(--titans-muted)] text-right">
              <div>{p.wins}V / {p.losses}D / {p.draws}E</div>
              <div>{getWinRate(p)}% WR</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gold">{p.points}</div>
              <div className="text-[10px] text-[var(--titans-blue)]">{p.rank}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
