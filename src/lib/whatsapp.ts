/**
 * Helpers de WhatsApp para TITANS ARENA
 *
 * phone: solo dígitos con código de país (ej. México 5215512345678)
 */

/** Link de la comunidad oficial — cámbialo por el invite real */
export const WHATSAPP_COMMUNITY_URL =
  "https://chat.whatsapp.com/H2IUKUtxj6jLqAvqn7V47r";

/** Limpia el número: solo dígitos */
export function cleanPhone(phone?: string | null): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

/**
 * Abre chat de WhatsApp con un mensaje listo.
 * Si no hay teléfono, no hace nada (devuelve null).
 */
export function buildWhatsAppChatUrl(phone: string, message: string): string | null {
  const num = cleanPhone(phone);
  if (!num || num.length < 10) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

/**
 * Mensaje profesional para contactar al rival por un partido.
 */
export function buildMatchMessage(opts: {
  myGamertag: string;
  rivalGamertag: string;
  tournamentName: string;
  round: string;
  scheduledAt?: string;
}): string {
  const fecha = opts.scheduledAt
    ? new Date(opts.scheduledAt).toLocaleString("es", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "por coordinar";

  return (
    `🏆 *TITANS ARENA*\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `Hola *${opts.rivalGamertag}*, soy *${opts.myGamertag}*.\n\n` +
    `Tenemos partido pendiente:\n` +
    `📌 Torneo: *${opts.tournamentName}*\n` +
    `⚔️ Ronda: *${opts.round}*\n` +
    `📅 Fecha: *${fecha}*\n\n` +
    `¿Confirmas horario y plataforma?\n` +
    `¡Que gane el mejor! 🔥`
  );
}

/**
 * Mensaje corto para invitar a la comunidad.
 */
export function buildCommunityInviteMessage(): string {
  return (
    `🏆 *TITANS ARENA*\n` +
    `La home of competitive eFootball.\n` +
    `Únete a la comunidad y compite por la gloria.\n` +
    `Juega. Compite. Evoluciona.`
  );
}
