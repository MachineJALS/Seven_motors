export const AGENCY = {
  name: "Seven Motor",
  city: "Tilarán, Guanacaste",
  whatsapp: "50660250218",
  email: "sevenmotor28@gmail.com",
  // Google Maps share link (opens the Maps app/site) — not an iframe embed
  // src. A real embedded map needs the "Embed a map" code from Google Maps'
  // Share dialog for the exact address; ask the dealer for that when ready.
  mapUrl: "https://maps.app.goo.gl/SS4EkFHFPC1z4X71A",
};

/**
 * Builds a WhatsApp (wa.me) link with a pre-filled message.
 * Uses the free wa.me link, not the paid WhatsApp Business API.
 */
export function buildWhatsAppLink(message: string): string {
  const number = AGENCY.whatsapp;
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}
