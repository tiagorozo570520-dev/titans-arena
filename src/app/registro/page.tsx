"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import type { Platform } from "@/lib/types";

export default function RegistroPage() {
  const { register } = useApp();
  const router = useRouter();
  const [form, setForm] = useState({
    gamertag: "",
    email: "",
    password: "",
    phone: "",
    platform: "PS5" as Platform,
    country: "México",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = form.phone.replace(/\D/g, "");
    if (!phone || phone.length < 10) {
      setError("WhatsApp es obligatorio. Código de país + número (mín. 10 dígitos). Ej: 573001234567");
      return;
    }
    const ok = register(form);
    if (ok) {
      router.push("/perfil");
    } else {
      setError("El email o gamertag ya está en uso");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative w-28 h-28 mx-auto mb-4 logo-blend">
            <Image src="/logo-titans.png" alt="TITANS" fill className="object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.45)]" />
          </div>
          <h1 className="text-2xl font-black text-gold">CREAR CUENTA</h1>
          <p className="text-sm text-[var(--titans-muted)] mt-1">
            Obtén tu TITANS ID y empieza a competir
          </p>
        </div>

        <form onSubmit={handleSubmit} className="titans-card p-6 md:p-8 space-y-4">
          {error && (
            <div className="bg-[rgba(239,68,68,0.15)] text-[var(--titans-danger)] text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--titans-muted)] uppercase mb-1.5">
              Gamertag
            </label>
            <input
              type="text"
              value={form.gamertag}
              onChange={(e) => setForm({ ...form, gamertag: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)] transition"
              placeholder="TuGamertag"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--titans-muted)] uppercase mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)] transition"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--titans-muted)] uppercase mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)] transition"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--titans-muted)] uppercase mb-1.5">
              WhatsApp (obligatorio, con código de país)
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)] transition"
              placeholder="573001234567"
              required
            />
            <p className="text-[10px] text-[var(--titans-muted)] mt-1">
              Así tu rival puede escribirte en 1 clic. Solo números, sin + ni espacios.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--titans-muted)] uppercase mb-1.5">
                Plataforma
              </label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)] transition"
              >
                <option value="PS5">PS5</option>
                <option value="Xbox">Xbox</option>
                <option value="PC">PC</option>
                <option value="Mobile">Mobile</option>
                <option value="Crossplay">Crossplay</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--titans-muted)] uppercase mb-1.5">
                País
              </label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--titans-gold)] transition"
              />
            </div>
          </div>

          <button type="submit" className="btn-titans w-full mt-2">
            CREAR CUENTA
          </button>
        </form>

        <p className="text-center text-sm text-[var(--titans-muted)] mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[var(--titans-gold)] hover:underline font-semibold">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
