import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/common.json";
import es from "./locales/es/common.json";

export const SUPPORTED_LANGUAGES = ["es", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = "agencia-autos-language";

function detectInitialLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "es" || stored === "en") return stored;

  // Seven Motor's customers are primarily Spanish-speaking (Costa Rica),
  // so Spanish is the default unless the browser clearly prefers English.
  return navigator.language.toLowerCase().startsWith("en") ? "en" : "es";
}

i18next.use(initReactI18next).init({
  resources: {
    es: { common: es },
    en: { common: en },
  },
  lng: detectInitialLanguage(),
  fallbackLng: "es",
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

i18next.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
});

export default i18next;
