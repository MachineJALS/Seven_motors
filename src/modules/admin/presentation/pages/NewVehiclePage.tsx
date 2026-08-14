import VehicleForm from "@/modules/admin/presentation/components/VehicleForm";
import { createVehicle } from "@/modules/admin/application/vehicle-admin";

export default function NewVehiclePage() {
  return (
    <div className="wrap">
      <VehicleForm onSubmit={createVehicle} />
    </div>
  );
}
