import React, { useState, useEffect } from "react";
import axios from "axios";
import { Compass, Calendar, ArrowRight, ShieldAlert, Sparkles, Trash } from "lucide-react";
import CancelBookingModal from "../components/CancelBookingModal";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function UserDashboard({ onSelectListing }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, past, cancelled
  
  // Cancel booking modal states
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  useEffect(() => {
    fetchMyTrips();
  }, []);

  const fetchMyTrips = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/bookings/my-trips");
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Failed to load user reservations:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async (bookingId) => {
    const res = await axios.post(`/api/bookings/${bookingId}/cancel`);
    fetchMyTrips();
    return res;
  };

  const canCancel = (booking) => {
    if (user?.role === "admin") return true;
    const bookingTime = new Date(booking.createdAt);
    const now = new Date();
    const diffHours = (now - bookingTime) / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  // Filter bookings by date and status
  const filteredBookings = bookings.filter(b => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(b.checkIn);
    checkInDate.setHours(0, 0, 0, 0);
    
    if (b.status === "cancelled") {
      return activeTab === "cancelled";
    }
    
    if (checkInDate >= today) {
      return activeTab === "upcoming";
    } else {
      return activeTab === "past";
    }
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-200">
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t("user_dashboard.title")}</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">{t("user_dashboard.subtitle")}</p>
      </div>

      {/* Tabs Menu in clean floating capsule */}
      <div className="flex border-b border-slate-200/50 dark:border-slate-800/40 space-x-6 mb-8 text-xs font-extrabold uppercase tracking-wider">
        {["upcoming", "past", "cancelled"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3.5 transition-all cursor-pointer border-b-2 font-bold ${
              activeTab === tab 
                ? "border-brand text-brand dark:text-brand-light" 
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {t(`user_dashboard.tab_${tab}`)}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="glass-panel border border-slate-200/60 dark:border-slate-800/40 rounded-3xl p-12 text-center shadow-sm">
          <Compass className="h-10 w-10 text-slate-400 dark:text-slate-555 mx-auto mb-4 animate-spin-slow" />
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">{t("user_dashboard.empty_title")}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
            {activeTab === "upcoming" 
              ? t("user_dashboard.empty_upcoming_subtitle") 
              : t("user_dashboard.empty_subtitle", { tab: t(`user_dashboard.tab_${activeTab}`) })}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const listing = b.listing;
            if (!listing) return null;
            return (
              <div 
                key={b._id}
                className="flex flex-col sm:flex-row bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover-float"
              >
                {/* Image Cover */}
                <div 
                  className="w-full sm:w-52 aspect-[16/10] sm:aspect-auto bg-cover bg-center shrink-0 cursor-pointer hover:opacity-95 transition-opacity"
                  style={{ backgroundImage: `url('${listing.image?.url || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400"}')` }}
                  onClick={() => onSelectListing(listing._id)}
                ></div>

                {/* Details */}
                <div className="p-6 flex-grow flex flex-col justify-between text-left">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 
                          onClick={() => onSelectListing(listing._id)}
                          className="font-extrabold text-base text-slate-900 dark:text-white hover:text-brand dark:hover:text-brand-light cursor-pointer transition tracking-tight"
                        >
                          {listing.location}, {listing.country}
                        </h4>
                        <p className="text-[11px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                          {listing.title?.[i18n.language || "en"] || listing.title?.en || listing.title || ""}
                        </p>
                      </div>
                      <span className="text-base font-extrabold text-brand dark:text-brand-light shrink-0">&#8377;{b.totalPrice.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center space-x-2.5 text-xs text-slate-700 dark:text-slate-350 mt-4 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 w-max font-bold">
                      <Calendar className="h-4 w-4 text-brand shrink-0" />
                      <span>{new Date(b.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(b.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 border-t border-slate-100 dark:border-slate-800/45 pt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-500 dark:text-slate-400 font-bold">
                        ID: {b._id.substring(18)}
                      </span>
                      {b.paymentStatus === "paid" ? (
                        <span className="text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30 dark:border-emerald-900/30 font-bold">
                          ✓ {t("user_dashboard.status_paid")}
                        </span>
                      ) : b.paymentStatus === "refunded" ? (
                        <span className="text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 border border-blue-200/30 dark:border-blue-900/30 font-bold">
                          ↺ {t("user_dashboard.status_refunded")}
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/30 dark:border-amber-900/30 font-bold">
                          ⚡ {t("user_dashboard.status_pending")}
                        </span>
                      )}
                    </div>
                    {activeTab === "upcoming" && (
                      canCancel(b) ? (
                        <button
                          onClick={() => {
                            setSelectedBookingForCancel(b);
                            setIsCancelModalOpen(true);
                          }}
                          className="px-4.5 py-2 border border-red-200 dark:border-red-950 text-red-550 dark:text-red-400 hover:bg-red-55 dark:hover:bg-red-950/20 text-xs font-extrabold rounded-xl transition active:scale-95 cursor-pointer uppercase tracking-wider flex items-center"
                        >
                          <Trash className="h-3.5 w-3.5 mr-1.5" /> {t("user_dashboard.cancel_btn")}
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-red-550 dark:text-red-400 px-3 py-2 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-xl">
                           {t("user_dashboard.refund_expired")}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <CancelBookingModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedBookingForCancel(null);
        }}
        booking={selectedBookingForCancel}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}
