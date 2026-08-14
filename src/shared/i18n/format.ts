import type { SupportedLanguage } from "./i18n";

const NUMBER_LOCALES: Record<SupportedLanguage, string> = {
  es: "es-CR",
  en: "en-US",
};

export function numberLocale(language: string): string {
  return NUMBER_LOCALES[language as SupportedLanguage] ?? NUMBER_LOCALES.es;
}
