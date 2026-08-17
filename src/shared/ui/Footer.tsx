import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AGENCY } from "@/shared/config/agency";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <span>
          {t("footer.rights", { year: new Date().getFullYear(), name: AGENCY.name, city: AGENCY.city })}
        </span>
        <nav className="footer__links">
          <Link to="/inventario">{t("nav.inventory")}</Link>
          <Link to="/financiamiento">{t("nav.financing")}</Link>
          <Link to="/sobre-nosotros">{t("nav.about")}</Link>
        </nav>
        <span>
          <a href={`mailto:${AGENCY.email}`}>{AGENCY.email}</a>
        </span>
        <span>{t("footer.privacyNotice")}</span>
      </div>
    </footer>
  );
}
