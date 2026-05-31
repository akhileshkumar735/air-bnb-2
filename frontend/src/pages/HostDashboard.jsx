import React, { useState, useEffect } from "react";
import axios from "axios";
import { Globe, DollarSign, Calendar, TrendingUp, BarChart2, Star, Home } from "lucide-react";

export default function HostDashboard({ onSelectListing }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostStats();
  }, []);

  const fetchHostStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/hosts/analytics");
      setStats(res.data.analytics || null);
    } catch (err) {
      console.error("Failed to load host dashboard:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
      </div>
    );
  }

  const hostProperties = stats?.listings || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-200">
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Host Dashboard</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">Track your occupancy, total earnings, active listings, and booking statistics.</p>
      </div>

      {/* Modern KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 text-left">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-brand/10 text-brand rounded-2xl shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              &#8377;{(stats?.totalRevenue || 0).toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-2xl shrink-0">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Active Homes</p>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {stats?.activeListingsCount || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-2xl shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Total Bookings</p>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {stats?.totalBookingsCount || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Occupancy Rate</p>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {stats?.occupancyRate || 0}%
            </h3>
          </div>
        </div>

      </div>

      {/* Dashboard Breakdown Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Earnings by Property bar chart card */}
        <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm lg:col-span-2 text-left">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider flex items-center mb-6 border-b border-slate-100 dark:border-slate-800/45 pb-3">
            <BarChart2 className="h-5 w-5 mr-2.5 text-brand" /> Earnings by Property
          </h3>
          
          {hostProperties.length === 0 ? (
            <p className="text-slate-500 text-xs italic text-center py-12">No earnings data to display yet.</p>
          ) : (
            <div className="space-y-5">
              {hostProperties.map((prop) => {
                const maxRevenue = Math.max(...hostProperties.map(p => p.revenue || 1));
                const pct = Math.round((prop.revenue / maxRevenue) * 100);
                return (
                  <div key={prop._id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                      <span 
                        className="truncate max-w-[70%] hover:text-brand hover:underline cursor-pointer transition" 
                        onClick={() => onSelectListing(prop._id)}
                      >
                        {prop.title}
                      </span>
                      <span>&#8377;{(prop.revenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-brand to-indigo-500 h-full rounded-full transition-all duration-700" 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Listings Performance summary card */}
        <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm text-left">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider flex items-center mb-6 border-b border-slate-100 dark:border-slate-800/45 pb-3">
            <Star className="h-5 w-5 mr-2.5 text-amber-400 fill-amber-400/20" /> Listings Summary
          </h3>

          {hostProperties.length === 0 ? (
            <p className="text-slate-500 text-xs italic text-center py-12">You have not created any listings yet.</p>
          ) : (
            <div className="divide-y divide-slate-150 dark:divide-slate-800/40">
              {hostProperties.map(prop => (
                <div key={prop._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p 
                      onClick={() => onSelectListing(prop._id)}
                      className="font-bold text-xs text-slate-850 dark:text-slate-250 truncate hover:text-brand hover:underline cursor-pointer transition"
                    >
                      {prop.title}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5 tracking-wider">{prop.location}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{prop.bookingsCount || 0} trips</p>
                    <div className="flex items-center text-[10px] text-slate-450 dark:text-slate-500 font-bold justify-end mt-0.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                      <span>{prop.averageRating > 0 ? prop.averageRating.toFixed(1) : "New"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
