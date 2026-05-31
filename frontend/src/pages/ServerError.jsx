import React from "react";
import { Compass, ShieldAlert } from "lucide-react";

export default function ServerError({ onGoHome }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-4 min-h-[500px] transition-colors duration-200">
      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full mb-6">
        <ShieldAlert className="h-16 w-16" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">500 - Server Error</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
        Something went wrong on our end. Our engineering team is currently investigating the issue. Please try again later.
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
