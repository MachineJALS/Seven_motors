import { useTranslation } from "react-i18next";
import { buildWhatsAppLink } from "@/shared/config/agency";
import WhatsAppIcon from "./WhatsAppIcon";

interface Props {
  message: string;
  sold?: boolean;
  className?: string;
}

/**
 * Opens WhatsApp with a pre-filled message. Uses the free wa.me link, not
 * the paid WhatsApp Business API. This is today's only lead-capture channel
 * (see src/modules/leads/domain/lead.ts for what Phase 2 will persist).
 */
export default function WhatsAppButton({ message, sold, className }: Props) {
  const { t } = useTranslation();

  if (sold) {
    return (
      <span className={`btn-whatsapp btn-whatsapp--vendido ${className ?? ""}`}>{t("whatsapp.sold")}</span>
    );
  }

  return (
    <a
      className={`btn-whatsapp ${className ?? ""}`}
      href={buildWhatsAppLink(message)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <WhatsAppIcon />
      {t("whatsapp.write")}
    </a>
  );
}
