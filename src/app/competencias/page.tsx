"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { enrolledCount } from "@/lib/enrollCount";

const formats = [
  { name: "Liga", desc: "Todos contra todos. Clasificación por puntos.", icon: "📊" },
  { name: "Grupos + Eliminación", desc: "Fase de grupos seguida de knockout.", icon: "🏟️" },
  { name: "Eliminación Directa", desc: "Bracket de eliminación. Un error y fuera.", icon: "⚔️" },
  { name: "Champions", desc: "Formato UEFA Champions League completo.", icon: "🏆" },
  { name: "Copa", desc: "Formato copero con ida y vuelta.", icon: "🥇" },
  { name: "Relámpago", desc: "Torneo exprés de un día.", icon: "⚡" },
  { name: "2 vs 2", desc: "Competición por parejas.", icon: "👥" },
  { name: "Mundial", desc: "Formato de Copa del Mundo.", icon: "🌍" },
];

export default function CompetenciasPage() {
  const { tournaments, enrollments } = useApp();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
          ⚔️ <span className="text-gold">COMPETENCIAS</span>
        </h1>
        <p className="text-[var(--titans-muted)] text-sm">
          Formatos disponibles y competiciones activas
        </p>
      </div>

      <h2 className="font-bold mb-4 text-sm uppercase tracking-wide text-[var(--titans-gold)]">
        Formatos soportados
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {formats.map((f) => (
          <div key={f.name} className="titans-card p-5">
            <div className="text-3xl mb-2">{f.icon}</div>
            <div className="font-bold">{f.name}</div>
            <div className="text-xs text-[var(--titans-muted)] mt-1">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm uppercase tracking-wide text-[var(--titans-gold)]">
          Competiciones activas
        </h2>
        <Link href="/torneos" className="text-sm text-[var(--titans-blue)] hover:underline">
          Ver todos →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tournaments
          .filter((t) => t.status === "open" || t.status === "live")
          .map((t) => (
            <Link
              key={t.id}
              href={`/torneos/${t.id}`}
              className="titans-card p-5 hover:border-[rgba(0,212,255,0.25)] transition"
            >
              <div className="font-bold text-lg">{t.name}</div>
              <div className="text-xs text-[var(--titans-muted)] mt-1 capitalize">
                {t.format.replace(/_/g, " ")} · {enrolledCount(t.id, enrollments)}/{t.maxPlayers} inscritos
              </div>
              <div className="text-sm text-gold mt-2">{t.prize}</div>
            </Link>
          ))}
      </div>
    </div>
  );
}
