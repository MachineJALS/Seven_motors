import { useTranslation } from "react-i18next";
import { AGENCY, buildWhatsAppLink } from "@/shared/config/agency";
import { recordLead } from "@/modules/leads/application/record-lead";

export default function FinancingPage() {
  const { t } = useTranslation();
  const message = t("financing.heroTitle") + ": " + t("financing.intro");

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1 className="hero__title">{t("financing.heroTitle")}</h1>
          <p className="hero__subtitle">{t("financing.intro")}</p>
        </div>
      </section>

      <div className="wrap section content-page">
        <h2>{t("financing.processTitle")}</h2>
        <p>{t("financing.processText")}</p>

        <a
          className="btn-cta"
          href={buildWhatsAppLink(t("financing.processTitle") + " — " + AGENCY.name)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            void recordLead({ source: "whatsapp-header", message });
          }}
        >
          {t("header.cta")}
        </a>

        <h2 className="content-page__section-spaced">{t("financing.visitTitle")}</h2>
        <p>{AGENCY.city}</p>
        <p>
          <a href={`mailto:${AGENCY.email}`}>{AGENCY.email}</a>
        </p>
        <a href={AGENCY.mapUrl} target="_blank" rel="noopener noreferrer" className="filtro-limpiar">
          {t("financing.mapLink")}
        </a>
      </div>
    </>
  );
}
