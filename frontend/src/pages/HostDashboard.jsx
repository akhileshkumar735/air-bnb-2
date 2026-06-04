import React, { useState, useEffect } from "react";
import axios from "axios";
import { Globe, DollarSign, Calendar, TrendingUp, BarChart2, Star, Home, Edit, Trash2, Plus } from "lucide-react";
import ListingFormModal from "../components/ListingFormModal";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";

export default function HostDashboard({ onSelectListing }) {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals & form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleCreateClick = () => {
    setSelectedListing(null);
    setIsFormOpen(true);
  };

  const handleEditClick = async (e, listingId) => {
    e.stopPropagation();
    setActionLoading(true);
    setErrorMessage("");
    try {
      const res = await axios.get(`/api/listings/${listingId}`);
      setSelectedListing(res.data.listing);
      setIsFormOpen(true);
    } catch (err) {
      console.error("Failed to fetch listing details for editing:", err);
      setErrorMessage("Could not retrieve listing details. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (e, listing) => {
    e.stopPropagation();
    setListingToDelete(listing);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!listingToDelete) return;
    setActionLoading(true);
    setErrorMessage("");
    try {
      await axios.delete(`/api/listings/${listingToDelete._id}`);
      setIsDeleteOpen(false);
      setListingToDelete(null);
      showToast("Property deleted successfully!", "success");
      // Refresh stats
      fetchHostStats();
    } catch (err) {
      console.error("Failed to delete listing:", err);
      setErrorMessage(err.response?.data?.message || "Could not delete listing. Please try again.");
    } finally {
      setActionLoading(false);
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
      
      {/* Top Banner and error messages */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-955/20 border border-red-200/50 dark:border-red-900/35 text-red-700 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center">
          <span className="mr-2">⚠️</span>
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage("")} className="ml-auto text-red-550 dark:text-red-400 font-extrabold cursor-pointer">{t("host_dashboard.dismiss")}</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t("host_dashboard.title")}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">{t("host_dashboard.subtitle")}</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-brand text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider active:scale-95 transition shadow-lg shadow-brand/10 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>{t("host_dashboard.add_new")}</span>
        </button>
      </div>

      {/* Modern KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 text-left">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-brand/10 text-brand rounded-2xl shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">{t("host_dashboard.total_revenue")}</p>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              &#8377;{(stats?.totalRevenue || 0).toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-955/40 text-indigo-500 rounded-2xl shrink-0">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">{t("host_dashboard.active_homes")}</p>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {stats?.activeListingsCount || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-955/40 text-emerald-500 rounded-2xl shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">{t("host_dashboard.total_bookings")}</p>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {stats?.totalBookingsCount || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-955/40 text-amber-500 rounded-2xl shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">{t("host_dashboard.occupancy_rate")}</p>
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
            <BarChart2 className="h-5 w-5 mr-2.5 text-brand" /> {t("host_dashboard.earnings_by_prop")}
          </h3>
          
          {hostProperties.length === 0 ? (
            <p className="text-slate-500 text-xs italic text-center py-12">{t("host_dashboard.no_earnings")}</p>
          ) : (
            <div className="space-y-5">
              {hostProperties.map((prop) => {
                const maxRevenue = Math.max(...hostProperties.map(p => p.revenue || 1));
                const pct = Math.round((prop.revenue / maxRevenue) * 100);
                const currentLang = i18n.language || "en";
                const propTitle = prop.title?.[currentLang] || prop.title?.en || prop.title || "";
                return (
                  <div key={prop._id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                      <span 
                        className="truncate max-w-[70%] hover:text-brand hover:underline cursor-pointer transition" 
                        onClick={() => onSelectListing(prop._id)}
                      >
                        {propTitle}
                      </span>
                      <span>&#8377;{(prop.revenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-brand to-indigo-505 h-full rounded-full transition-all duration-700" 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Listings Performance summary card with action tools */}
        <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm text-left">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider flex items-center mb-6 border-b border-slate-100 dark:border-slate-800/45 pb-3">
            <Star className="h-5 w-5 mr-2.5 text-amber-400 fill-amber-400/20" /> {t("host_dashboard.listings_summary")}
          </h3>

          {hostProperties.length === 0 ? (
            <p className="text-slate-500 text-xs italic text-center py-12">{t("host_dashboard.no_listings")}</p>
          ) : (
            <div className="divide-y divide-slate-150 dark:divide-slate-800/40">
              {hostProperties.map(prop => {
                const currentLang = i18n.language || "en";
                const propTitle = prop.title?.[currentLang] || prop.title?.en || prop.title || "";
                return (
                  <div key={prop._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p 
                        onClick={() => onSelectListing(prop._id)}
                        className="font-bold text-xs text-slate-850 dark:text-slate-250 truncate hover:text-brand hover:underline cursor-pointer transition"
                      >
                        {propTitle}
                      </p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{prop.location}</p>
                        <span className="text-slate-300 dark:text-slate-750 text-[9px]">•</span>
                        <div className="flex items-center text-[9px] text-slate-450 dark:text-slate-500 font-bold">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-0.5" />
                          <span>{prop.averageRating > 0 ? prop.averageRating.toFixed(1) : "New"}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions & bookings count */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <div className="text-right mr-1.5 hidden sm:block">
                        <p className="font-extrabold text-[10px] text-slate-800 dark:text-slate-300">
                          {prop.bookingsCount === 1 ? t("host_dashboard.bookings_count_one") : t("host_dashboard.bookings_count_other", { count: prop.bookingsCount || 0 })}
                        </p>
                      </div>
                      
                      {/* Action buttons */}
                      <button
                        onClick={(e) => handleEditClick(e, prop._id)}
                        disabled={actionLoading}
                        className="p-1.5 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-950 dark:hover:bg-indigo-955/40 text-slate-400 hover:text-indigo-500 rounded-lg border border-slate-200 dark:border-slate-800 active:scale-95 transition cursor-pointer"
                        title={t("host_dashboard.edit_property")}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, prop)}
                        disabled={actionLoading}
                        className="p-1.5 bg-slate-50 hover:bg-rose-50 dark:bg-slate-950 dark:hover:bg-rose-955/40 text-slate-400 hover:text-rose-500 rounded-lg border border-slate-200 dark:border-slate-800 active:scale-95 transition cursor-pointer"
                        title={t("host_dashboard.delete_property")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Listing Create/Edit Form Modal */}
      <ListingFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        listing={selectedListing}
        onSuccess={() => fetchHostStats()}
      />

      {/* Custom Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl rounded-3xl p-6 sm:p-8 max-w-md w-full animate-scale-up">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/50 pb-3">
              {t("host_dashboard.delete_title")}
            </h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 font-semibold leading-relaxed mt-4">
              {t("host_dashboard.delete_confirm", { title: listingToDelete?.title?.[i18n.language || "en"] || listingToDelete?.title?.en || listingToDelete?.title || "" })}
            </p>
            <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-955/10 border border-rose-250 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 rounded-2xl text-[10px] font-bold leading-normal flex items-start">
              <span className="mr-2">⚠️</span>
              <span>{t("host_dashboard.delete_warning")}</span>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsDeleteOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-55 dark:hover:bg-slate-850 rounded-xl text-[10px] font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
              >
                {t("host_dashboard.keep_listing")}
              </button>
              <button
                onClick={confirmDelete}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-red-655 to-rose-700 hover:from-red-750 hover:to-rose-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[100px] cursor-pointer shadow-lg shadow-red-950/20"
              >
                {actionLoading ? (
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  t("host_dashboard.confirm_delete")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
