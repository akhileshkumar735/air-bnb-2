import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Custom React hook to dynamically manage localized SEO tags in the document head.
 * Updates title, meta description, and inserts hreflang alternate links for SEO crawling.
 * 
 * @param {object} params
 * @param {string} params.title - The localized page title.
 * @param {string} params.description - The localized page description.
 * @param {string} params.pathname - Optional path relative to origin.
 */
export function useSEO({ title, description, pathname = "" } = {}) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "en";

  useEffect(() => {
    // 1. Update Title tag
    const baseTitle = "AntiGravity | Luxury Gravity-Defying Stays";
    document.title = title ? `${title} | AntiGravity` : baseTitle;

    // 2. Update Meta Description tag
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    const defaultDesc = "Discover gravity-defying luxury stays and immersive travel experiences worldwide. AntiGravity is your gateway to premium, modern vacation rentals.";
    metaDesc.setAttribute("content", description || defaultDesc);

    // 3. Update hreflang link tags (SEO standard for multilingual sites)
    const supportedLangs = ["en", "hi", "fr", "es"];
    const baseHref = window.location.origin + (pathname.startsWith("/") ? pathname : `/${pathname}`);

    // Remove existing alternate tags to avoid duplicates
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangs.forEach((el) => el.remove());

    // Inject localized alternate tags
    supportedLangs.forEach((lang) => {
      const link = document.createElement("link");
      link.setAttribute("rel", "alternate");
      link.setAttribute("hreflang", lang);
      link.setAttribute("href", `${baseHref}?lng=${lang}`);
      document.head.appendChild(link);
    });

    // Add x-default pointing to English as standard fallback
    const xDefault = document.createElement("link");
    xDefault.setAttribute("rel", "alternate");
    xDefault.setAttribute("hreflang", "x-default");
    xDefault.setAttribute("href", `${baseHref}?lng=en`);
    document.head.appendChild(xDefault);

  }, [title, description, pathname, currentLang]);
}
