import { useTranslation } from "react-i18next";
import { AGENCY, buildWhatsAppLink } from "@/shared/config/agency";
import { recordLead } from "@/modules/leads/application/record-lead";

export default function AboutPage() {
  const { t } = useTranslation();
  const message = t("about.contactTitle") + ": " + AGENCY.name;

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1 className="hero__title">{t("about.heroTitle")}</h1>
        </div>
      </section>

      <div className="wrap section content-page">
        <h2>{t("about.storyTitle")}</h2>
        <p>{t("about.storyText", { name: AGENCY.name, city: AGENCY.city })}</p>

        <h2 className="content-page__section-spaced">{t("about.whyTitle")}</h2>
        <div className="services-grid">
          <div className="service-card">
            <h3>{t("about.why1Title")}</h3>
            <p>{t("about.why1Text")}</p>
          </div>
          <div className="service-card">
            <h3>{t("about.why2Title")}</h3>
            <p>{t("about.why2Text")}</p>
          </div>
          <div className="service-card">
            <h3>{t("about.why3Title")}</h3>
            <p>{t("about.why3Text")}</p>
          </div>
        </div>

        <h2 className="content-page__section-spaced">{t("about.contactTitle")}</h2>
        <p>
          <a href={`mailto:${AGENCY.email}`}>{AGENCY.email}</a>
        </p>
        <a
          className="btn-cta"
          href={buildWhatsAppLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            void recordLead({ source: "whatsapp-header", message });
          }}
        >
          {t("header.cta")}
        </a>
      </div>
    </>
  );
}
