import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "./locales/en/translation.json";
import translationHI from "./locales/hi/translation.json";
import translationFR from "./locales/fr/translation.json";
import translationES from "./locales/es/translation.json";

const resources = {
  en: {
    translation: translationEN
  },
  hi: {
    translation: translationHI
  },
  fr: {
    translation: translationFR
  },
  es: {
    translation: translationES
  }
};

// Retrieve language from localStorage or default to English ('en')
const savedLanguage = localStorage.getItem("wonderlust_lang") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
