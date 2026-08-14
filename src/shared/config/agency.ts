export const AGENCY = {
  name: "Seven Motor",
  city: "Tilarán, Guanacaste",
  whatsapp: "50660250218",
  email: "sevenmotor28@gmail.com",
  mapEmbedUrl: "https://maps.app.goo.gl/SS4EkFHFPC1z4X71A",
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
