import React, { useState } from "react";
import { Search, MapPin, Users } from "lucide-react";

export default function Hero({ onSearch }) {
  const [query, setQuery] = useState("");
  const [guests, setGuests] = useState(1);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch({ q: query, guests });
  };

  return (
    <div 
      className="relative h-[480px] md:h-[550px] w-full flex items-center justify-center bg-cover bg-center overflow-hidden transition-all duration-300 select-none" 
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.45), rgba(11, 15, 25, 0.9)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80')` 
      }}
    >
      {/* Background ambient lighting effects for Anti-Gravity theme */}
      <div className="absolute top-12 left-1/4 w-72 h-72 rounded-full bg-brand/10 dark:bg-brand/15 blur-[100px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-12 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px] pointer-events-none animate-pulse-slow"></div>

      <div className="relative text-center text-white px-4 z-10 max-w-3xl space-y-6 md:space-y-8">
        
        {/* Immersive typography headings */}
        <div className="space-y-3">
          <span className="inline-block text-[11px] md:text-xs font-extrabold uppercase tracking-widest bg-brand text-white px-3 py-1 rounded-full shadow-sm hover:scale-105 transition-transform">
            Next-Gen Luxury Rentals
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-md leading-tight">
            Experience <span className="bg-gradient-to-r from-brand via-pink-400 to-indigo-400 bg-clip-text text-transparent">Wonderlust</span> Stays
          </h1>
          <p className="text-sm sm:text-base md:text-lg drop-shadow-sm text-slate-200/90 max-w-xl mx-auto font-medium tracking-wide">
            Discover handpicked gravity-defying architecture, floating pools, and luxury spaces across the cosmos.
          </p>
        </div>

        {/* Floating Futuristic Search Cockpit */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="flex flex-col md:flex-row bg-white/95 dark:bg-slate-900/90 p-2.5 rounded-2xl md:rounded-full shadow-2xl border border-slate-100 dark:border-slate-800/80 w-full max-w-3xl space-y-3 md:space-y-0 md:space-x-2.5 backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-brand/40 dark:focus-within:ring-indigo-500/40"
        >
          {/* Destination Selector */}
          <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/65 group">
            <MapPin className="h-5 w-5 text-brand group-focus-within:scale-110 transition-transform mr-3 shrink-0" />
            <div className="flex-grow flex flex-col text-left">
              <label className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500">Destination</label>
              <input 
                type="text" 
                placeholder="Where are you going? (e.g. Udaipur)" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-slate-850 dark:text-white placeholder-slate-400 text-xs font-bold mt-0.5"
              />
            </div>
          </div>

          {/* Guest Selector */}
          <div className="flex items-center px-4 py-2 md:w-44 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/65 group">
            <Users className="h-5 w-5 text-brand group-focus-within:scale-110 transition-transform mr-3 shrink-0" />
            <div className="flex-grow flex flex-col text-left">
              <label className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500">Guests</label>
              <select 
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="bg-transparent border-none outline-none w-full text-slate-850 dark:text-white text-xs font-bold mt-0.5 cursor-pointer"
              >
                <option value={1} className="dark:bg-slate-900">1 Guest</option>
                <option value={2} className="dark:bg-slate-900">2 Guests</option>
                <option value={3} className="dark:bg-slate-900">3 Guests</option>
                <option value={4} className="dark:bg-slate-900">4+ Guests</option>
              </select>
            </div>
          </div>

          {/* Glowing Submit Button */}
          <button 
            type="submit" 
            className="w-full md:w-auto px-7 py-3.5 bg-gradient-to-r from-brand to-pink-650 hover:from-brand-dark hover:to-pink-700 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-brand/20 dark:hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Search className="h-4.5 w-4.5 mr-2" /> Search Stays
          </button>
        </form>

      </div>
      
      {/* Wave bottom decoration */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-8 bg-slate-50 dark:bg-slate-950 pointer-events-none transform translate-y-1" 
        style={{ borderRadius: "100% 100% 0 0" }}
      ></div>
    </div>
  );
}
