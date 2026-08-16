import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLeads } from "@/modules/admin/application/leads-admin";
import { numberLocale } from "@/shared/i18n/format";
import type { Lead } from "@/modules/leads/domain/lead";

export default function LeadsPage() {
  const { t, i18n } = useTranslation();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getLeads()
      .then(setLeads)
      .catch(() => setError(true));
  }, []);

  const dateFormatter = new Intl.DateTimeFormat(numberLocale(i18n.resolvedLanguage ?? "es"), {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="wrap">
      <div className="admin-header">
        <h1>{t("admin.leads.title")}</h1>
        <Link to="/admin" className="filtro-limpiar">
          {t("admin.leads.back")}
        </Link>
      </div>

      {error && <p className="vacio">{t("status.error")}</p>}
      {leads === null && !error && <p className="vacio">{t("status.loading")}</p>}
      {leads !== null && leads.length === 0 && <p className="vacio">{t("admin.leads.empty")}</p>}

      {leads !== null && leads.length > 0 && (
        <table className="admin-table">
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <strong>{t(`admin.leads.source.${lead.source}`)}</strong>
                  <br />
                  {lead.vehicleId ? (
                    <Link to={`/vehiculo/${lead.vehicleId}`}>{lead.vehicleId}</Link>
                  ) : (
                    t("admin.leads.noVehicle")
                  )}
                </td>
                <td>{lead.message}</td>
                <td>{dateFormatter.format(new Date(lead.createdAt))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
