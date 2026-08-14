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
        <span>
          <a href={`mailto:${AGENCY.email}`}>{AGENCY.email}</a>
        </span>
        <span>{t("footer.privacyNotice")}</span>
      </div>
    </footer>
  );
}
