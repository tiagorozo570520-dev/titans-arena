"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { WHATSAPP_COMMUNITY_URL } from "@/lib/whatsapp";

const navItems = [
  { href: "/", label: "INICIO", icon: "🏠" },
  { href: "/torneos", label: "TORNEOS", icon: "🏆" },
  { href: "/competencias", label: "COMPETENCIAS", icon: "⚔️" },
  { href: "/ranking", label: "RANKING", icon: "📊" },
  { href: "/jugadores", label: "JUGADORES", icon: "👤" },
  { href: "/calendario", label: "CALENDARIO", icon: "📅" },
  { href: "/campeones", label: "CAMPEONES", icon: "🏅" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, isLoggedIn, logout } = useApp();

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-[rgba(212,175,55,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 md:w-12 md:h-12 logo-blend">
              <Image
                src="/logo-titans.png"
                alt="TITANS"
                fill
                className="object-contain drop-shadow-[0_0_14px_rgba(212,175,55,0.45)] group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg md:text-xl font-black tracking-wider text-gold leading-none">
                TITANS
              </div>
              <div className="text-[10px] md:text-xs text-[var(--titans-muted)] tracking-widest uppercase">
                ARENA
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                    active
                      ? "bg-[rgba(212,175,55,0.15)] text-[var(--titans-gold)]"
                      : "text-[var(--titans-muted)] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth / Profile */}
          <div className="flex items-center gap-3">
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[rgba(37,211,102,0.12)] text-[#25D366] border border-[rgba(37,211,102,0.3)] hover:bg-[rgba(37,211,102,0.22)] transition"
              title="Comunidad WhatsApp TITANS"
            >
              💬 Comunidad
            </a>
            {isLoggedIn && currentUser ? (
              <>
                {currentUser.isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[rgba(0,212,255,0.1)] text-[var(--titans-blue)] border border-[rgba(0,212,255,0.25)] hover:bg-[rgba(0,212,255,0.2)] transition"
                  >
                    ⚙️ ADMIN
                  </Link>
                )}
                <Link
                  href="/perfil"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--titans-gold)] to-[var(--titans-blue)] flex items-center justify-center text-xs font-bold text-black">
                    {currentUser.gamertag.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold leading-none">{currentUser.gamertag}</div>
                    <div className="text-[10px] text-[var(--titans-muted)]">{currentUser.titansId}</div>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-[var(--titans-muted)] hover:text-white transition px-2"
                >
                  Salir
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-titans-outline !py-2 !px-4 !text-xs">
                  Entrar
                </Link>
                <Link href="/registro" className="btn-titans !py-2 !px-4 !text-xs hidden sm:inline-flex">
                  Registro
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
