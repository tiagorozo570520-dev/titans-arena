import type { Metadata } from "next";
import { Orbitron, Rajdhani, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

const display = Orbitron({
  variable: "--font-titans-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const sans = Rajdhani({
  variable: "--font-titans-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TITANS ARENA | The Home of Competitive eFootball",
  description: "La comunidad competitiva de eFootball donde los mejores jugadores se enfrentan por la gloria. Juega. Compite. Evoluciona.",
  keywords: ["eFootball", "TITANS", "torneos", "esports", "competitivo", "ranking"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${sans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--titans-black)] text-[var(--titans-white)] arena-bg">
        <AppProvider>
          <Navbar />
          <main className="flex-1 pb-20 md:pb-8">{children}</main>
          <MobileNav />
        </AppProvider>
      </body>
    </html>
  );
}
