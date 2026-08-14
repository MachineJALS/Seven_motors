import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { signInWithPassword } from "@/modules/admin/application/auth";
import { useAuth } from "@/modules/admin/presentation/useAuth";

export default function LoginPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  if (session) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      await signInWithPassword(email, password);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wrap admin-login">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h1>{t("admin.login.title")}</h1>

        <div className="filtro-campo">
          <label htmlFor="admin-email">{t("admin.login.email")}</label>
          <input
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="filtro-campo">
          <label htmlFor="admin-password">{t("admin.login.password")}</label>
          <input
            id="admin-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="admin-form__error">{t("admin.login.error")}</p>}

        <button type="submit" className="btn-whatsapp" disabled={submitting}>
          {submitting ? t("admin.login.submitting") : t("admin.login.submit")}
        </button>
      </form>
    </div>
  );
}
