import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useVehicles } from "@/modules/inventory/presentation/hooks/useVehicles";
import VehicleCard from "@/modules/inventory/presentation/components/VehicleCard";
import VehicleCardSkeleton from "@/modules/inventory/presentation/components/VehicleCardSkeleton";
import FilterBar from "@/modules/inventory/presentation/components/FilterBar";
import {
  emptyFilters,
  filterVehicles,
  listBrands,
  listFuelTypes,
  type VehicleFilters,
} from "@/modules/inventory/application/filter-vehicles";

export default function CatalogPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<VehicleFilters>({
    ...emptyFilters,
    query: searchParams.get("q") ?? "",
  });
  const { vehicles, loading, error } = useVehicles();

  const brands = useMemo(() => listBrands(vehicles), [vehicles]);
  const fuelTypes = useMemo(() => listFuelTypes(vehicles), [vehicles]);
  const filteredVehicles = useMemo(() => filterVehicles(vehicles, filters), [vehicles, filters]);

  let content: ReactNode;
  if (loading) {
    content = (
      <div className="grid" aria-busy="true" aria-label={t("status.loading")}>
        {Array.from({ length: 6 }, (_, i) => (
          <VehicleCardSkeleton key={i} />
        ))}
      </div>
    );
  } else if (error) {
    content = <p className="vacio">{t("status.error")}</p>;
  } else {
    content = (
      <>
        <FilterBar filters={filters} brands={brands} fuelTypes={fuelTypes} onChange={setFilters} />

        <p className="catalogo-meta">
          {t("catalog.metaCount", { count: filteredVehicles.length, total: vehicles.length })}
        </p>

        {filteredVehicles.length === 0 ? (
          <p className="vacio">{t("catalog.empty")}</p>
        ) : (
          <div className="grid">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1 className="hero__title">{t("catalog.heroTitle")}</h1>
          <p className="hero__subtitle">{t("catalog.heroSubtitle")}</p>
        </div>
      </section>

      <div className="wrap">{content}</div>
    </>
  );
}
