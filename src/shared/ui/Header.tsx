import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AGENCY, buildWhatsAppLink } from "@/shared/config/agency";
import LanguageSwitcher from "@/shared/i18n/LanguageSwitcher";
import { buildGeneralInquiryMessage } from "@/modules/leads/application/build-whatsapp-inquiry";
import { recordLead } from "@/modules/leads/application/record-lead";
import WhatsAppIcon from "@/modules/leads/presentation/components/WhatsAppIcon";

export default function Header() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const message = buildGeneralInquiryMessage(t);

  const navLinkClass = ({ isActive }: { isActive: boolean }) => (isActive ? "nav__link nav__link--active" : "nav__link");

  return (
    <header className="header">
      <div className="wrap header__inner">
        <Link to="/" className="header__brand" onClick={() => setMenuOpen(false)}>
          <span className="header__brand-name">{AGENCY.name}</span>
          <span className="header__brand-city">{AGENCY.city}</span>
        </Link>

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={menuOpen ? "nav nav--open" : "nav"}>
          <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/inventario" className={navLinkClass} onClick={() => setMenuOpen(false)}>
            {t("nav.inventory")}
          </NavLink>
          <NavLink to="/financiamiento" className={navLinkClass} onClick={() => setMenuOpen(false)}>
            {t("nav.financing")}
          </NavLink>
          <NavLink to="/sobre-nosotros" className={navLinkClass} onClick={() => setMenuOpen(false)}>
            {t("nav.about")}
          </NavLink>
        </nav>

        <div className="header__actions">
          <LanguageSwitcher />
          <a
            className="header__cta"
            href={buildWhatsAppLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("header.cta")}
            title={t("header.cta")}
            onClick={() => {
              void recordLead({ source: "whatsapp-header", message });
            }}
          >
            <WhatsAppIcon />
          </a>
        </div>
      </div>
    </header>
  );
}
