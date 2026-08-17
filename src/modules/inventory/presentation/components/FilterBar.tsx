import { useTranslation } from "react-i18next";
import type { FuelType } from "@/modules/inventory/domain/vehicle";
import { emptyFilters, type VehicleFilters } from "@/modules/inventory/application/filter-vehicles";

interface Props {
  filters: VehicleFilters;
  brands: string[];
  fuelTypes: FuelType[];
  onChange: (filters: VehicleFilters) => void;
}

export default function FilterBar({ filters, brands, fuelTypes, onChange }: Props) {
  const { t } = useTranslation();

  const update = (field: keyof VehicleFilters, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="filtros">
      <div className="filtro-campo">
        <label htmlFor="f-query">{t("filters.query")}</label>
        <input
          id="f-query"
          type="search"
          placeholder={t("filters.queryPlaceholder")}
          value={filters.query}
          onChange={(e) => update("query", e.target.value)}
        />
      </div>

      <div className="filtro-campo">
        <label htmlFor="f-brand">{t("filters.brand")}</label>
        <select id="f-brand" value={filters.brand} onChange={(e) => update("brand", e.target.value)}>
          <option value="">{t("filters.allBrands")}</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className="filtro-campo">
        <label htmlFor="f-price">{t("filters.maxPrice")}</label>
        <input
          id="f-price"
          type="number"
          min={0}
          placeholder={t("filters.maxPriceUnlimited")}
          value={filters.maxPrice}
          onChange={(e) => update("maxPrice", e.target.value)}
        />
      </div>

      <div className="filtro-campo">
        <label htmlFor="f-year">{t("filters.yearFrom")}</label>
        <input
          id="f-year"
          type="number"
          min={1990}
          max={2030}
          placeholder={t("filters.yearAny")}
          value={filters.yearFrom}
          onChange={(e) => update("yearFrom", e.target.value)}
        />
      </div>

      <div className="filtro-campo">
        <label htmlFor="f-fuel">{t("filters.fuelType")}</label>
        <select id="f-fuel" value={filters.fuelType} onChange={(e) => update("fuelType", e.target.value)}>
          <option value="">{t("filters.allFuelTypes")}</option>
          {fuelTypes.map((fuelType) => (
            <option key={fuelType} value={fuelType}>
              {t(`enums.fuelType.${fuelType}`)}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button type="button" className="filtro-limpiar" onClick={() => onChange(emptyFilters)}>
          {t("filters.clear")}
        </button>
      )}
    </div>
  );
}
