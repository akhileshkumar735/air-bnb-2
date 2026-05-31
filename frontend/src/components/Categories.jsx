import React from "react";
import { Palmtree, Mountain, History, TreePine, Flame, Building2, Crown, Waves, Compass, Sailboat } from "lucide-react";

const categoryList = [
  { label: "Beach", icon: Palmtree },
  { label: "Mountain", icon: Mountain },
  { label: "Historic", icon: History },
  { label: "Treehouse", icon: TreePine },
  { label: "Desert", icon: Flame },
  { label: "City", icon: Building2 },
  { label: "Castle", icon: Crown },
  { label: "Pool", icon: Waves },
  { label: "Countryside", icon: Compass },
  { label: "Lakefront", icon: Sailboat }
];

export default function Categories({ selectedCategory, onSelectCategory }) {
  return (
    <div className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/40 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hide raw scrollbars via tailwind scrollbar utilities or css styles */}
        <div className="flex items-center space-x-4 sm:space-x-6 overflow-x-auto pb-1.5 scrollbar-none justify-start md:justify-center">
          {categoryList.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedCategory === item.label;
            return (
              <button
                key={item.label}
                onClick={() => onSelectCategory(isSelected ? "" : item.label)}
                className={`group flex flex-col items-center justify-center py-2 px-3 sm:px-4 rounded-2xl cursor-pointer text-[11px] font-bold tracking-wide transition-all duration-300 whitespace-nowrap min-w-[76px] space-y-1.5 active:scale-95 ${
                  isSelected 
                    ? "bg-brand/10 dark:bg-brand/15 text-brand dark:text-brand-light shadow-sm" 
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <Icon className={`h-5 w-5 transition duration-300 ${isSelected ? "scale-110" : "group-hover:-translate-y-0.5"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        
      </div>
    </div>
  );
}
