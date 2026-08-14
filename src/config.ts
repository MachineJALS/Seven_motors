export const AGENCIA = {
  nombre: "Seven Motor",
  ciudad: "Tilarán, Guanacaste",
  whatsapp: "50660250218",
  correo: "sevenmotor28@gmail.com",
  mapaEmbedUrl:
    "https://maps.app.goo.gl/SS4EkFHFPC1z4X71A",
};

/**
 * Arma un link de WhatsApp (wa.me) con un mensaje pre-cargado.
 * No usa la API de pago de WhatsApp Business, es el link gratuito estándar.
 */
export function armarLinkWhatsApp(mensaje: string): string {
  const numero = AGENCIA.whatsapp;
  const texto = encodeURIComponent(mensaje);
  return `https://wa.me/${numero}?text=${texto}`;
}
