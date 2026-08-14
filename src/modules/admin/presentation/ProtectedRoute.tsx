import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "./useAuth";

export default function ProtectedRoute({ children }: { children: ReactElement }) {
  const { t } = useTranslation();
  const { session } = useAuth();

  if (session === undefined) {
    return (
      <div className="wrap pagina-404">
        <p>{t("status.loading")}</p>
      </div>
    );
  }

  if (session === null) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
