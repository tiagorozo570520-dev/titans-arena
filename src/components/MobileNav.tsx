"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

const items = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/torneos", label: "Torneos", icon: "🏆" },
  { href: "/ranking", label: "Ranking", icon: "📊" },
  { href: "/campeones", label: "Campeones", icon: "🏅" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { isLoggedIn, currentUser } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-[rgba(212,175,55,0.15)] pb-safe">
      <div className="flex items-center justify-around h-16 px-1">
                {currentUser?.isAdmin && (
          <Link
            href="/admin"
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 ${
              pathname.startsWith("/admin") ? "text-[var(--titans-gold)]" : "text-[var(--titans-blue)]"
            }`}
          >
            <span className="text-lg">⚙️</span>
            <span className="text-[10px] font-medium tracking-wide">Admin</span>
          </Link>
        )}
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const href = item.href === "/perfil" && !isLoggedIn ? "/login" : item.href;
          return (
            <Link
              key={item.href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                active ? "text-[var(--titans-gold)]" : "text-[var(--titans-muted)]"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
