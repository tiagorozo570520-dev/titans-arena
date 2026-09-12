"use client";

import Link from "next/link";
import type { Tournament } from "@/lib/types";

const statusMap = {
  open: { label: "INSCRIPCIONES ABIERTAS", class: "badge-open" },
  soon: { label: "PRÓXIMAMENTE", class: "badge-soon" },
  live: { label: "EN CURSO", class: "badge-live" },
  finished: { label: "FINALIZADO", class: "badge-finished" },
};

export default function TournamentCard({ tournament }: { tournament: Tournament }) {
  const status = statusMap[tournament.status];

  return (
    <div className="titans-card overflow-hidden group">
      <div
        className="h-28 relative bg-cover bg-center"
        style={{
          background: tournament.image
            ? undefined
            : tournament.primaryColor
            ? `linear-gradient(135deg, ${tournament.primaryColor} 0%, #0a0b10 100%)`
            : "linear-gradient(135deg, #1a1b25 0%, #0a0b10 100%)",
          backgroundImage: tournament.image ? `url(${tournament.image})` : undefined,
        }}
      >
        {!tournament.image && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-40">🏆</span>
          </div>
        )}
        {tournament.logo && (
          <div className="absolute bottom-2 left-3 w-12 h-12 rounded-lg overflow-hidden border border-white/20 bg-black/40">
            <img src={tournament.logo} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`badge ${status.class}`}>{status.label}</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-gold transition-colors">
          {tournament.name}
        </h3>
        {tournament.subtitle && (
          <p className="text-xs text-[var(--titans-muted)] mb-3">{tournament.subtitle}</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--titans-muted)] mb-4">
          <div>
            <span className="text-white font-semibold">{tournament.currentPlayers}</span>/
            {tournament.maxPlayers} jugadores
          </div>
          <div>
            Premio: <span className="text-gold font-semibold">{tournament.prize}</span>
          </div>
          <div>
            {new Date(tournament.startDate).toLocaleDateString("es", {
              day: "2-digit",
              month: "short",
            })}
          </div>
          <div className="capitalize">{tournament.format.replace("_", " ")}</div>
        </div>

        <Link
          href={`/torneos/${tournament.id}`}
          className="btn-titans-outline w-full text-center block !py-2.5 !text-xs"
        >
          VER TORNEO
        </Link>
      </div>
    </div>
  );
}
