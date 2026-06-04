import React from "react";
import { Compass, AlertOctagon } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound({ onGoHome }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-4 min-h-[500px] transition-colors duration-200">
      <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full mb-6 animate-pulse">
        <AlertOctagon className="h-16 w-16" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
        {t("errors.not_found_title")}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed font-semibold">
        {t("errors.not_found_desc")}
      </p>
      <button
        onClick={onGoHome}
        className="px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition flex items-center cursor-pointer"
      >
        <Compass className="h-4 w-4 mr-2" /> {t("errors.go_home")}
      </button>
    </div>
  );
}
