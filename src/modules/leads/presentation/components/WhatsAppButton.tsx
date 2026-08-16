import { useTranslation } from "react-i18next";
import { buildWhatsAppLink } from "@/shared/config/agency";
import { recordLead } from "@/modules/leads/application/record-lead";
import WhatsAppIcon from "./WhatsAppIcon";

interface Props {
  message: string;
  vehicleId?: string;
  sold?: boolean;
  className?: string;
}

/**
 * Opens WhatsApp with a pre-filled message. Uses the free wa.me link, not
 * the paid WhatsApp Business API. Also records a Lead on click, without
 * delaying or affecting the redirect (see .claude/specs/lead-persistence/spec.md).
 */
export default function WhatsAppButton({ message, vehicleId, sold, className }: Props) {
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
      onClick={() => {
        void recordLead({ source: "whatsapp-vehicle-inquiry", vehicleId, message });
      }}
    >
      <WhatsAppIcon />
      {t("whatsapp.write")}
    </a>
  );
}
