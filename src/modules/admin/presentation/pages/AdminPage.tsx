import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useVehicles } from "@/modules/inventory/presentation/hooks/useVehicles";
import { updateVehicle, deleteVehicle } from "@/modules/admin/application/vehicle-admin";
import { signOut } from "@/modules/admin/application/auth";
import type { Vehicle } from "@/modules/inventory/domain/vehicle";

export default function AdminPage() {
  const { t } = useTranslation();
  const { vehicles, loading, error } = useVehicles();
  const [items, setItems] = useState<Vehicle[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const list = items ?? vehicles;

  const handleToggleSold = async (vehicle: Vehicle) => {
    setBusyId(vehicle.id);
    const updated = { ...vehicle, sold: !vehicle.sold };
    try {
      await updateVehicle(vehicle.id, updated);
      setItems(list.map((v) => (v.id === vehicle.id ? updated : v)));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!window.confirm(t("admin.list.confirmDelete"))) return;
    setBusyId(vehicle.id);
    try {
      await deleteVehicle(vehicle.id);
      setItems(list.filter((v) => v.id !== vehicle.id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="wrap">
      <div className="admin-header">
        <h1>{t("admin.nav.title")}</h1>
        <div className="admin-header__actions">
          <Link to="/admin/leads" className="filtro-limpiar">
            {t("admin.nav.viewLeads")}
          </Link>
          <button type="button" className="filtro-limpiar" onClick={() => void signOut()}>
            {t("admin.nav.signOut")}
          </button>
        </div>
      </div>

      <div className="admin-header">
        <h2>{t("admin.list.title")}</h2>
        <Link to="/admin/vehicles/new" className="btn-whatsapp admin-add-link">
          {t("admin.list.addVehicle")}
        </Link>
      </div>

      {loading && <p className="vacio">{t("status.loading")}</p>}
      {error && <p className="vacio">{t("status.error")}</p>}
      {!loading && !error && list.length === 0 && <p className="vacio">{t("admin.list.empty")}</p>}

      {!loading && !error && list.length > 0 && (
        <table className="admin-table">
          <tbody>
            {list.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>
                  {vehicle.brand} {vehicle.model} {vehicle.year}
                  {vehicle.sold && <span className="admin-table__sold-badge">{t("admin.list.sold")}</span>}
                </td>
                <td className="admin-table__actions">
                  <button
                    type="button"
                    className="filtro-limpiar"
                    disabled={busyId === vehicle.id}
                    onClick={() => handleToggleSold(vehicle)}
                  >
                    {vehicle.sold ? t("admin.list.markAvailable") : t("admin.list.markSold")}
                  </button>
                  <Link to={`/admin/vehicles/${vehicle.id}/edit`} className="filtro-limpiar">
                    {t("admin.list.edit")}
                  </Link>
                  <button
                    type="button"
                    className="filtro-limpiar"
                    disabled={busyId === vehicle.id}
                    onClick={() => handleDelete(vehicle)}
                  >
                    {t("admin.list.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
