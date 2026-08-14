import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { vehicles } from "@/modules/inventory/infrastructure/static-vehicle-repository";
import PriceTag from "@/modules/inventory/presentation/components/PriceTag";
import WhatsAppButton from "@/modules/leads/presentation/components/WhatsAppButton";
import { buildVehicleInquiryMessage } from "@/modules/leads/application/build-whatsapp-inquiry";
import { AGENCY } from "@/shared/config/agency";
import { numberLocale } from "@/shared/i18n/format";

export default function VehicleDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const vehicle = vehicles.find((v) => v.id === id);
  const [activePhoto, setActivePhoto] = useState(0);
  const km = new Intl.NumberFormat(numberLocale(i18n.resolvedLanguage ?? "es"));

  if (!vehicle) {
    return (
      <div className="wrap pagina-404">
        <h1>{t("detail.notFoundTitle")}</h1>
        <p>{t("detail.notFoundText")}</p>
        <Link to="/">{t("detail.back")}</Link>
      </div>
    );
  }

  return (
    <div className="wrap">
      <Link to="/" className="ficha-volver">
        {t("detail.back")}
      </Link>

      <div className="ficha">
        <div>
          <div className="ficha__foto-principal">
            <img src={vehicle.photos[activePhoto]} alt={`${vehicle.brand} ${vehicle.model}`} />
          </div>
          {vehicle.photos.length > 1 && (
            <div className="ficha__miniaturas">
              {vehicle.photos.map((photo, i) => (
                <button
                  key={photo}
                  className={i === activePhoto ? "activa" : ""}
                  onClick={() => setActivePhoto(i)}
                  aria-label={`${i + 1}`}
                >
                  <img src={photo} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="ficha__titulo">
            {vehicle.brand} {vehicle.model} {vehicle.year}
          </h1>
          <p className="ficha__ubicacion">{AGENCY.city}</p>

          <PriceTag price={vehicle.price} size="lg" />

          <table className="ficha__tabla">
            <tbody>
              <tr>
                <td>{t("detail.year")}</td>
                <td>{vehicle.year}</td>
              </tr>
              <tr>
                <td>{t("detail.mileage")}</td>
                <td>{km.format(vehicle.mileage)} km</td>
              </tr>
              <tr>
                <td>{t("detail.transmission")}</td>
                <td>{t(`enums.transmission.${vehicle.transmission}`)}</td>
              </tr>
              <tr>
                <td>{t("detail.fuelType")}</td>
                <td>{t(`enums.fuelType.${vehicle.fuelType}`)}</td>
              </tr>
              <tr>
                <td>{t("detail.color")}</td>
                <td>{vehicle.color}</td>
              </tr>
            </tbody>
          </table>

          <p className="ficha__descripcion">{vehicle.description}</p>

          <WhatsAppButton message={buildVehicleInquiryMessage(vehicle, t)} sold={vehicle.sold} />
        </div>
      </div>
    </div>
  );
}
