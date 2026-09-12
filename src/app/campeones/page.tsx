"use client";

import { useApp } from "@/context/AppContext";

export default function CampeonesPage() {
  const { champions, players } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
          🏆 <span className="text-gold">HALL OF CHAMPIONS</span>
        </h1>
        <p className="text-[var(--titans-muted)] text-sm max-w-md mx-auto">
          Los jugadores que alcanzaron la gloria. Sus nombres quedarán grabados para siempre.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {champions.map((c) => {
          const player = players.find((p) => p.id === c.playerId);
          if (!player) return null;
          return (
            <div key={c.id} className="titans-card p-6 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-[rgba(212,175,55,0.08)] to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="text-5xl mb-4">🏆</div>
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[var(--titans-gold)] to-[var(--titans-blue)] flex items-center justify-center text-xl font-bold text-black mb-3">
                {player.gamertag.slice(0, 2).toUpperCase()}
              </div>
              <div className="font-black text-lg">{player.gamertag}</div>
              <div className="text-xs text-[var(--titans-muted)] mb-2">{player.titansId}</div>
              <div className="text-sm font-semibold text-gold">{c.tournamentName}</div>
              <div className="text-xs text-[var(--titans-muted)] mt-1">
                {new Date(c.date).toLocaleDateString("es", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="mt-3 text-xs">
                <span className="badge badge-finished">{c.titlesCount} títulos</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
