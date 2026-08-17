import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useVehicles } from "@/modules/inventory/presentation/hooks/useVehicles";
import VehicleCard from "@/modules/inventory/presentation/components/VehicleCard";
import VehicleCardSkeleton from "@/modules/inventory/presentation/components/VehicleCardSkeleton";
import { AGENCY, buildWhatsAppLink } from "@/shared/config/agency";
import { buildGeneralInquiryMessage } from "@/modules/leads/application/build-whatsapp-inquiry";
import { recordLead } from "@/modules/leads/application/record-lead";

const FEATURED_COUNT = 4;

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { vehicles, loading } = useVehicles();
  const [query, setQuery] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/inventario${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  };

  const handleFinalCta = () => {
    void recordLead({ source: "whatsapp-header", message: buildGeneralInquiryMessage(t) });
  };

  return (
    <>
      <section className="hero hero--home">
        <div className="wrap">
          <h1 className="hero__title">{t("home.heroTitle", { city: AGENCY.city })}</h1>
          <p className="hero__subtitle">{t("home.heroSubtitle")}</p>

          <div className="hero__actions">
            <Link to="/inventario" className="btn-cta">
              {t("home.ctaInventory")}
            </Link>
            <a
              className="btn-whatsapp hero__whatsapp"
              href={buildWhatsAppLink(buildGeneralInquiryMessage(t))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleFinalCta}
            >
              {t("header.cta")}
            </a>
          </div>

          <form className="hero__search" onSubmit={handleSearch} role="search">
            <input
              type="search"
              placeholder={t("home.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t("filters.query")}
            />
            <button type="submit" className="filtro-limpiar">
              {t("home.searchButton")}
            </button>
          </form>
        </div>
      </section>

      <section className="wrap section">
        <h2>{t("home.servicesTitle")}</h2>
        <div className="services-grid">
          <div className="service-card">
            <ServiceIcon kind="sales" />
            <h3>{t("home.serviceSalesTitle")}</h3>
            <p>{t("home.serviceSalesText")}</p>
          </div>
          <div className="service-card">
            <ServiceIcon kind="financing" />
            <h3>{t("home.serviceFinancingTitle")}</h3>
            <p>{t("home.serviceFinancingText")}</p>
          </div>
          <div className="service-card">
            <ServiceIcon kind="advice" />
            <h3>{t("home.serviceAdviceTitle")}</h3>
            <p>{t("home.serviceAdviceText")}</p>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section__header">
          <h2>{t("home.featuredTitle")}</h2>
          <Link to="/inventario" className="ver-mas">
            {t("home.featuredCta")}
          </Link>
        </div>

        <div className="grid">
          {loading
            ? Array.from({ length: FEATURED_COUNT }, (_, i) => <VehicleCardSkeleton key={i} />)
            : vehicles.slice(0, FEATURED_COUNT).map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
        </div>
      </section>

      <section className="final-cta">
        <div className="wrap final-cta__inner">
          <div>
            <h2>{t("home.finalCtaTitle", { city: AGENCY.city })}</h2>
            <p>{t("home.finalCtaText")}</p>
            <a href={AGENCY.mapUrl} target="_blank" rel="noopener noreferrer" className="filtro-limpiar">
              {t("home.mapLink")}
            </a>
          </div>
          <a
            className="btn-cta"
            href={buildWhatsAppLink(buildGeneralInquiryMessage(t))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleFinalCta}
          >
            {t("header.cta")}
          </a>
        </div>
      </section>
    </>
  );
}

function ServiceIcon({ kind }: { kind: "sales" | "financing" | "advice" }) {
  const paths: Record<typeof kind, string> = {
    sales: "M4 17h1.5a2.5 2.5 0 0 0 5 0h7a2.5 2.5 0 0 0 5 0H24M3 17V9l3-5h9l4 5h3a2 2 0 0 1 2 2v6M3 17h1",
    financing: "M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm0 0 2-3h12l2 3M8 13h3m5 0h.01",
    advice: "M4 5h16v10H9l-5 4V5Z",
  };

  return (
    <svg width="28" height="28" viewBox="0 0 28 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[kind]} />
    </svg>
  );
}
