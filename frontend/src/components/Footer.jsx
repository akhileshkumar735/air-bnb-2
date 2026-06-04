import React from "react";
import { Globe, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t, i18n } = useTranslation();

  const getLanguageName = (code) => {
    switch (code) {
      case "hi": return "हिन्दी (Hindi)";
      case "fr": return "Français (French)";
      case "es": return "Español (Spanish)";
      default: return "English (US)";
    }
  };

  return (
    <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/40 text-slate-550 dark:text-slate-400 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <h5 className="font-extrabold text-slate-900 dark:text-slate-200 tracking-tight text-sm uppercase">{t("footer.support")}</h5>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.help_center")}</a></li>
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.aircover")}</a></li>
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.anti_discrimination")}</a></li>
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.disability_support")}</a></li>
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.cancellation_options")}</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h5 className="font-extrabold text-slate-900 dark:text-slate-200 tracking-tight text-sm uppercase">{t("footer.hosting")}</h5>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.host_your_home")}</a></li>
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.host_aircover")}</a></li>
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.hosting_resources")}</a></li>
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.community_forum")}</a></li>
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.host_responsibly")}</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h5 className="font-extrabold text-slate-900 dark:text-slate-200 tracking-tight text-sm uppercase">{t("footer.company")}</h5>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.newsroom")}</a></li>
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.new_features")}</a></li>
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.careers")}</a></li>
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.investors")}</a></li>
              <li><a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.gift_cards")}</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h5 className="font-extrabold text-slate-900 dark:text-slate-200 tracking-tight text-sm uppercase">{t("footer.socials")}</h5>
            <div className="flex space-x-3 mb-4">
              <a 
                href="#" 
                className="p-2.5 bg-slate-200/70 dark:bg-slate-900 rounded-xl hover:bg-brand dark:hover:bg-brand hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95" 
                aria-label="Facebook"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="p-2.5 bg-slate-200/70 dark:bg-slate-900 rounded-xl hover:bg-brand dark:hover:bg-brand hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95" 
                aria-label="Twitter"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="p-2.5 bg-slate-200/70 dark:bg-slate-900 rounded-xl hover:bg-brand dark:hover:bg-brand hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95" 
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
            <p className="text-[11px] text-slate-450 dark:text-slate-500 font-medium">
              {t("footer.made_with")} <Heart className="h-3 w-3 inline fill-brand text-brand animate-pulse-slow" /> {t("footer.by")} <span className="font-semibold text-slate-750 dark:text-slate-350">{t("footer.team")}</span>.
            </p>
          </div>
          
        </div>
        
        <hr className="my-8 border-slate-200/60 dark:border-slate-800/40" />
        
        <div className="flex flex-col md:flex-row items-center justify-between text-xs font-semibold tracking-wide uppercase text-slate-450 dark:text-slate-500">
          <p>&copy; {new Date().getFullYear()} {t("footer.rights_reserved")}</p>
          <div className="flex space-x-4 mt-4 md:mt-0 items-center">
            <a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.privacy")}</a>
            <span className="text-slate-300 dark:text-slate-800">&middot;</span>
            <a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.terms")}</a>
            <span className="text-slate-300 dark:text-slate-800">&middot;</span>
            <a href="#" className="hover:text-brand dark:hover:text-brand-light transition">{t("footer.sitemap")}</a>
            <span className="text-slate-300 dark:text-slate-800">&middot;</span>
            <div className="flex items-center hover:text-brand dark:hover:text-brand-light transition normal-case font-medium">
              <Globe className="h-3.5 w-3.5 mr-1" /> {getLanguageName(i18n.language)}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
