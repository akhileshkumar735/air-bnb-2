import React from "react";
import { Compass, AlertOctagon } from "lucide-react";

export default function NotFound({ onGoHome }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-4 min-h-[500px] transition-colors duration-200">
      <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full mb-6 animate-pulse">
        <AlertOctagon className="h-16 w-16" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
        The page you are looking for does not exist, has been removed, or is temporarily unavailable. Let's get you back on track!
      </p>
      <button
        onClick={onGoHome}
        className="px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-full font-semibold text-sm shadow-md transition flex items-center cursor-pointer"
      >
        <Compass className="h-4 w-4 mr-2" /> Go back home
      </button>
    </div>
  );
}
