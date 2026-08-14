import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useVehicle } from "@/modules/inventory/presentation/hooks/useVehicle";
import VehicleForm from "@/modules/admin/presentation/components/VehicleForm";
import { updateVehicle } from "@/modules/admin/application/vehicle-admin";

export default function EditVehiclePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { vehicle } = useVehicle(id);

  if (vehicle === undefined) {
    return (
      <div className="wrap">
        <p>{t("status.loading")}</p>
      </div>
    );
  }

  if (vehicle === null || !id) {
    return (
      <div className="wrap">
        <p>{t("status.error")}</p>
      </div>
    );
  }

  return (
    <div className="wrap">
      <VehicleForm initial={vehicle} onSubmit={(v) => updateVehicle(id, v)} />
    </div>
  );
}
