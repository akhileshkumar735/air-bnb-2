import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिन्दी (Hindi)" },
    { code: "fr", name: "Français (French)" },
    { code: "es", name: "Español (Spanish)" }
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("wonderlust_lang", code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 border border-slate-200/60 dark:border-slate-800/80 p-2.5 rounded-full hover:shadow-sm transition-all duration-300 bg-white dark:bg-slate-850 hover:border-slate-350 dark:hover:border-slate-700 active:scale-95 cursor-pointer text-slate-650 dark:text-slate-300"
        aria-label="Select Language"
      >
        <Globe className="h-4.5 w-4.5 text-slate-500 dark:text-slate-450" />
        <span className="text-[11px] font-black uppercase tracking-wider hidden md:inline">
          {currentLang.code}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-3.5 w-48 glass-panel rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/40 py-2 text-xs z-50 transition transform origin-top-right scale-100">
            <div className="px-3 py-1.5 border-b border-slate-250/20 text-[9px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">
              Select Language
            </div>
            <div className="p-1 space-y-0.5">
              {languages.map((lang) => {
                const isSelected = lang.code === i18n.language;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition cursor-pointer font-bold ${
                      isSelected
                        ? "bg-brand/10 text-brand dark:bg-brand/15 dark:text-brand-light"
                        : "text-slate-700 dark:text-slate-350 hover:bg-slate-100/60 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span>{lang.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
