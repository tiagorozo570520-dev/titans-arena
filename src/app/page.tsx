"use client";

import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import TournamentCard from "@/components/TournamentCard";

export default function HomePage() {
  const { tournaments, players, matches, champions, isLoggedIn } = useApp();

  const activeTournaments = tournaments.filter((t) => t.status === "open" || t.status === "live");
  const totalMatches = matches.length;
  const totalPlayers = players.length;

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--titans-black)] via-[#0a0b14] to-[var(--titans-black)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.08)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--titans-black)] to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 md:pt-20 pb-16 md:pb-24">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-44 h-44 md:w-60 md:h-60 mb-4 animate-logo logo-blend">
              <Image
                src="/logo-titans.png"
                alt="TITANS eFootball Community"
                fill
                className="object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.55)]"
                priority
              />
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-[0.12em] text-gold mb-3">
              TITANS
            </h1>
            <p className="text-sm md:text-base tracking-[0.3em] text-[var(--titans-blue)] font-semibold mb-6 uppercase">
              The Home of Competitive eFootball
            </p>

            <h2 className="text-xl md:text-3xl font-bold text-white mb-4 max-w-2xl leading-tight">
              COMPITE. DOMINA.{" "}
              <span className="text-gold">CONVIÉRTETE EN LEYENDA.</span>
            </h2>

            <p className="text-[var(--titans-muted)] text-sm md:text-base max-w-xl mb-8 leading-relaxed">
              La comunidad competitiva de eFootball donde los mejores jugadores se enfrentan por la gloria.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link href={isLoggedIn ? "/torneos" : "/registro"} className="btn-titans text-center">
                ENTRAR A TITANS
              </Link>
              <Link href="/torneos" className="btn-titans-outline text-center">
                VER TORNEOS
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
              {[
                { label: "Torneos Activos", value: activeTournaments.length, icon: "🏆" },
                { label: "Jugadores", value: totalPlayers, icon: "👤" },
                { label: "Partidos", value: totalMatches, icon: "⚔️" },
                { label: "Campeones", value: champions.length, icon: "🏅" },
              ].map((stat) => (
                <div key={stat.label} className="titans-card p-4 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-black text-gold">{stat.value}</div>
                  <div className="text-[10px] md:text-xs text-[var(--titans-muted)] uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 border-y border-[rgba(212,175,55,0.1)]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm md:text-base tracking-[0.2em] text-[var(--titans-muted)] uppercase">
            JUEGA · COMPITE · EVOLUCIONA
          </p>
          <p className="text-xs text-[var(--titans-muted)] mt-2 opacity-70">
            EL CAMINO HACIA LA GLORIA COMIENZA AQUÍ
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              🔥 <span className="text-gold">TORNEOS DESTACADOS</span>
            </h2>
            <Link href="/torneos" className="text-sm text-[var(--titans-blue)] hover:underline font-medium">
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.slice(0, 3).map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[rgba(10,11,16,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              📊 <span className="text-gold">TOP RANKING</span>
            </h2>
            <Link href="/ranking" className="text-sm text-[var(--titans-blue)] hover:underline font-medium">
              Ranking completo →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {players
              .slice()
              .sort((a, b) => b.points - a.points)
              .slice(0, 3)
              .map((p, i) => (
                <div
                  key={p.id}
                  className={`titans-card p-5 flex items-center gap-4 ${
                    i === 0 ? "ring-1 ring-[var(--titans-gold)]/40" : ""
                  }`}
                >
                  <div className="text-3xl font-black">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{p.gamertag}</div>
                    <div className="text-xs text-[var(--titans-muted)]">{p.titansId}</div>
                    <div className="text-sm text-[var(--titans-blue)] font-semibold mt-0.5">
                      {p.points} pts · {p.rank}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            ¿Listo para <span className="text-gold">dominar</span>?
          </h2>
          <p className="text-[var(--titans-muted)] mb-8">
            Únete a la comunidad competitiva más exclusiva de eFootball. Crea tu cuenta, obtén tu TITANS ID y empieza a competir.
          </p>
          <Link href={isLoggedIn ? "/torneos" : "/registro"} className="btn-titans inline-block">
            {isLoggedIn ? "IR A TORNEOS" : "CREAR CUENTA AHORA"}
          </Link>
        </div>
      </section>
    </div>
  );
}
