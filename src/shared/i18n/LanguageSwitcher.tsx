import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "./i18n";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="language-switcher" role="group" aria-label="Language / Idioma">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          className={i18n.resolvedLanguage === lang ? "active" : ""}
          onClick={() => i18n.changeLanguage(lang)}
          aria-pressed={i18n.resolvedLanguage === lang}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
