import React from "react";
import { Inbox, Compass } from "lucide-react";

export default function EmptyState({ 
  title = "No results found", 
  subtitle = "Try adjusting your search filters or browse other popular categories.",
  actionLabel = "Clear all filters",
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 min-h-[400px]">
      <div className="p-4 bg-gray-150 dark:bg-neutral-800 rounded-full text-gray-400 dark:text-neutral-500 mb-4 animate-bounce">
        <Inbox className="h-12 w-12" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-450 max-w-md mb-8">
        {subtitle}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-full font-semibold text-sm shadow-sm transition flex items-center"
        >
          <Compass className="h-4 w-4 mr-2" /> {actionLabel}
        </button>
      )}
    </div>
  );
}
