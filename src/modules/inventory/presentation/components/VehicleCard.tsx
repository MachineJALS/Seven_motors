import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Vehicle } from "@/modules/inventory/domain/vehicle";
import { numberLocale } from "@/shared/i18n/format";
import { resolveVehiclePhotos } from "@/modules/inventory/application/resolve-vehicle-photos";
import PriceTag from "./PriceTag";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { t, i18n } = useTranslation();
  const km = new Intl.NumberFormat(numberLocale(i18n.resolvedLanguage ?? "es"));
  const [primaryPhoto] = resolveVehiclePhotos(vehicle);

  return (
    <Link className="card" to={`/vehiculo/${vehicle.id}`}>
      <div className="card__media">
        {vehicle.sold && <span className="badge-vendido">{t("whatsapp.sold")}</span>}
        <img src={primaryPhoto?.url} alt={primaryPhoto?.alt ?? `${vehicle.brand} ${vehicle.model}`} loading="lazy" />
      </div>
      <div className="card__body">
        <h3 className="card__title">
          {vehicle.brand} {vehicle.model} {vehicle.year}
        </h3>
        <div className="card__specs">
          <span>{km.format(vehicle.mileage)} km</span>
          <span>·</span>
          <span>{t(`enums.transmission.${vehicle.transmission}`)}</span>
          <span>·</span>
          <span>{t(`enums.fuelType.${vehicle.fuelType}`)}</span>
        </div>
        <div className="card__footer">
          <PriceTag price={vehicle.price} />
          <span className="ver-mas">{t("vehicleCard.viewDetails")}</span>
        </div>
      </div>
    </Link>
  );
}
