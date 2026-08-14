import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AGENCY, buildWhatsAppLink } from "@/shared/config/agency";
import LanguageSwitcher from "@/shared/i18n/LanguageSwitcher";
import { buildGeneralInquiryMessage } from "@/modules/leads/application/build-whatsapp-inquiry";

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="header">
      <div className="wrap header__inner">
        <Link to="/" className="header__brand">
          <span className="header__brand-name">{AGENCY.name}</span>
          <span className="header__brand-city">{AGENCY.city}</span>
        </Link>
        <div className="header__actions">
          <LanguageSwitcher />
          <a
            className="header__cta"
            href={buildWhatsAppLink(buildGeneralInquiryMessage(t))}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("header.cta")}
          </a>
        </div>
      </div>
    </header>
  );
}
