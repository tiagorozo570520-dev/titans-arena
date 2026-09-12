"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function LoginPage() {
  const { login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(email, password);
    if (ok) {
      router.push("/perfil");
    } else {
      setError("Credenciales incorrectas. Prueba con: shadow@titans.gg o admin");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative w-28 h-28 mx-auto mb-4 logo-blend">
            <Image src="/logo-titans.png" alt="TITANS" fill className="object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.45)]" />
          </div>
          <h1 className="text-2xl font-black text-gold">INICIAR SESIÓN</h1>
          <p className="text-sm text-[var(--titans-muted)] mt-1">Accede a TITANS ARENA</p>
        </div>

        <form onSubmit={handleSubmit} className="titans-card p-6 md:p-8 space-y-5">
          {error && (
            <div className="bg-[rgba(239,68,68,0.15)] text-[var(--titans-danger)] text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--titans-muted)] uppercase mb-1.5">
              Email o Gamertag
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)] transition"
              placeholder="shadow@titans.gg"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--titans-muted)] uppercase mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)] transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-titans w-full">
            ENTRAR
          </button>

          <p className="text-xs text-center text-[var(--titans-muted)]">
            Demo: usa <strong>shadow@titans.gg</strong> o <strong>admin</strong> (cualquier contraseña)
          </p>
        </form>

        <p className="text-center text-sm text-[var(--titans-muted)] mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-[var(--titans-gold)] hover:underline font-semibold">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
