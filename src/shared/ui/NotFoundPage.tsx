import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="wrap pagina-404">
      <h1>{t("notFound.title")}</h1>
      <p>
        <Link to="/">{t("notFound.backLink")}</Link>
      </p>
    </div>
  );
}
