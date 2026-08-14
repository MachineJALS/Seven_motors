import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { vehicles } from "@/modules/inventory/infrastructure/static-vehicle-repository";
import VehicleCard from "@/modules/inventory/presentation/components/VehicleCard";
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
  const [filters, setFilters] = useState<VehicleFilters>(emptyFilters);

  const brands = useMemo(() => listBrands(vehicles), []);
  const fuelTypes = useMemo(() => listFuelTypes(vehicles), []);
  const filteredVehicles = useMemo(() => filterVehicles(vehicles, filters), [filters]);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1 className="hero__title">{t("catalog.heroTitle")}</h1>
          <p className="hero__subtitle">{t("catalog.heroSubtitle")}</p>
        </div>
      </section>

      <div className="wrap">
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
      </div>
    </>
  );
}
