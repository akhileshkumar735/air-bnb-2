import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useWishlist } from "../context/WishlistContext";
import { useTax } from "../context/TaxContext";
import { Sun, Moon, Compass, Heart, User, LogOut, Menu, Globe, Search } from "lucide-react";

export default function Navbar({ onSearchTrigger, activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { wishlist } = useWishlist();
  const { showTax, toggleShowTax } = useTax();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add event listener to trace scroll for dynamic header opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/40 shadow-sm" 
          : "bg-white/95 dark:bg-slate-900/95 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo with Orbit Animation */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group" 
            onClick={() => { setActiveTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
            <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-brand to-indigo-600 shadow-md group-hover:scale-105 transition-transform duration-300">
              <Globe className="h-6 w-6 text-white animate-spin-slow" />
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-brand to-indigo-600 opacity-30 blur group-hover:opacity-60 transition duration-300"></div>
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand to-indigo-600 dark:from-white dark:to-indigo-300 bg-clip-text text-transparent transition">
              AntiGravity
            </span>
          </div>

          {/* Premium Search Trigger (Center) */}
          <div 
            onClick={onSearchTrigger}
            className="hidden sm:flex items-center space-x-4 pl-6 pr-2 py-2 border border-slate-200/60 dark:border-slate-800/80 rounded-full hover:shadow-md cursor-pointer transition-all duration-300 bg-white dark:bg-slate-850 hover:border-brand/40 dark:hover:border-indigo-500/40"
          >
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-500">Where</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">Anywhere</span>
            </div>
            <span className="h-6 w-px bg-slate-200 dark:bg-slate-800"></span>
            
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-500">When</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">Any week</span>
            </div>
            <span className="h-6 w-px bg-slate-200 dark:bg-slate-800"></span>
            
            <div className="flex flex-col text-left pr-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-500">Who</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Add guests</span>
            </div>
            
            <div className="p-2.5 bg-brand text-white rounded-full hover:scale-105 active:scale-95 shadow-sm hover:shadow-brand/20 transition-all duration-300">
              <Search className="h-4 w-4" />
            </div>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Tax Switch Toggle */}
            <div className="flex items-center space-x-2.5 border border-slate-200/60 dark:border-slate-800/80 px-3 py-1.5 rounded-full bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-300 mr-1 sm:mr-2">
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-350 tracking-wider uppercase">
                <span className="hidden sm:inline">Display total after taxes</span>
                <span className="hidden min-[380px]:inline sm:hidden">Taxes</span>
              </span>
              <button 
                onClick={toggleShowTax}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-offset-white dark:ring-offset-slate-900 focus:ring-2 focus:ring-brand/50 ${showTax ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-600'}`}
                aria-label="Toggle Tax Display"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showTax ? 'translate-x-4' : 'translate-x-0'}`}
                />
              </button>
            </div>

            {/* Dark Mode Selector with Smooth Twist */}
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full transition-all duration-200 active:scale-90"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-amber-400 hover:rotate-45 transition-transform duration-500" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600 hover:-rotate-12 transition-transform duration-500" />
              )}
            </button>

            {/* Wishlist Button with Floating Badge */}
            <button 
              onClick={() => setActiveTab("wishlist")}
              className="relative p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 active:scale-90 group"
              aria-label="Wishlist"
            >
              <Heart className={`h-5 w-5 transition duration-300 group-hover:scale-110 ${activeTab === "wishlist" ? "fill-brand text-brand" : "text-slate-600 dark:text-slate-300"}`} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-brand text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-bounce">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Premium Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 border border-slate-200/60 dark:border-slate-800/80 p-1.5 pl-3 rounded-full hover:shadow-sm transition-all duration-300 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700"
              >
                <Menu className="h-4.5 w-4.5 text-slate-500 dark:text-slate-450" />
                {user ? (
                  <div className="relative">
                    <img 
                      src={user.avatar} 
                      alt="User profile avatar" 
                      className="h-7 w-7 rounded-full object-cover border border-slate-100 dark:border-slate-700 shadow-inner" 
                    />
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900"></span>
                  </div>
                ) : (
                  <div className="h-7 w-7 rounded-full bg-slate-150 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-450">
                    <User className="h-4.5 w-4.5" />
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <>
                  {/* Overlay to catch clicks and close */}
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                  
                  <div className="absolute right-0 mt-3.5 w-64 glass-panel rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/40 py-2.5 text-sm z-50 transition transform origin-top-right scale-100">
                    {user ? (
                      <>
                        <div className="px-4 py-3.5 border-b border-slate-200/50 dark:border-slate-800/35">
                          <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{user.username}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-550 truncate mt-0.5">{user.email}</p>
                        </div>
                        <div className="p-1">
                          <button 
                            onClick={() => { setActiveTab("profile"); setDropdownOpen(false); }}
                            className="w-full text-left px-3.5 py-2 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 text-slate-750 dark:text-slate-300 rounded-xl flex items-center transition"
                          >
                            <User className="h-4 w-4 mr-2.5 text-slate-450 dark:text-slate-500" /> 
                            <span>My Profile</span>
                          </button>
                          <button 
                            onClick={() => { setActiveTab("guest-dashboard"); setDropdownOpen(false); }}
                            className="w-full text-left px-3.5 py-2 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 text-slate-750 dark:text-slate-300 rounded-xl flex items-center transition"
                          >
                            <Compass className="h-4 w-4 mr-2.5 text-slate-450 dark:text-slate-500" /> 
                            <span>Trips & Bookings</span>
                          </button>
                          <button 
                            onClick={() => { setActiveTab("host-dashboard"); setDropdownOpen(false); }}
                            className="w-full text-left px-3.5 py-2 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 text-slate-750 dark:text-slate-300 rounded-xl flex items-center transition"
                          >
                            <Globe className="h-4 w-4 mr-2.5 text-slate-450 dark:text-slate-500" /> 
                            <span>Host Dashboard</span>
                          </button>
                        </div>
                        <hr className="my-1 border-slate-200/50 dark:border-slate-800/35" />
                        <div className="p-1">
                          <button 
                            onClick={() => { logout(); setDropdownOpen(false); setActiveTab("home"); }}
                            className="w-full text-left px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-550 dark:text-red-400 rounded-xl flex items-center transition font-semibold"
                          >
                            <LogOut className="h-4 w-4 mr-2.5 text-red-450 dark:text-red-500" /> 
                            <span>Log out</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-1">
                        <button 
                          onClick={() => { setActiveTab("login"); setDropdownOpen(false); }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 text-slate-850 dark:text-slate-200 rounded-xl font-bold transition"
                        >
                          Log in
                        </button>
                        <button 
                          onClick={() => { setActiveTab("signup"); setDropdownOpen(false); }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-xl font-medium transition"
                        >
                          Create Account
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}
