import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTax } from "../context/TaxContext";
import CancelBookingModal from "../components/CancelBookingModal";
import ListingFormModal from "../components/ListingFormModal";
import { 
  Star, MapPin, Calendar, Users, ArrowLeft, Send, ShieldAlert, 
  Wifi, Car, Tv, Wind, ShieldCheck, Flame, Compass, Coffee, CheckCircle,
  Edit, Trash2, Settings
} from "lucide-react";

import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";
import { useSEO } from "../hooks/useSEO";

export default function ListingDetail({ listingId, onBack }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showTax } = useTax();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentLang = i18n.language || "en";
  const localizedTitle = listing?.title?.[currentLang] || listing?.title?.en || listing?.title || "";
  const localizedDesc = listing?.description?.[currentLang] || listing?.description?.en || listing?.description || "";
  const localizedAmenities = listing?.amenities?.[currentLang] || listing?.amenities?.en || "";
  const localizedRules = listing?.houseRules?.[currentLang] || listing?.houseRules?.en || "";
  const localizedLocationDesc = listing?.locationDescription?.[currentLang] || listing?.locationDescription?.en || "";

  useSEO({
    title: localizedTitle,
    description: localizedDesc,
    pathname: `/listings/${listingId}`
  });
  const [bookedDates, setBookedDates] = useState([]);
  
  // Bookings tracking states
  const [userBookings, setUserBookings] = useState([]);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  
  // Booking Form State
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Host Owner Actions State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [hostActionLoading, setHostActionLoading] = useState(false);
  const [hostActionError, setHostActionError] = useState("");

  const isOwner = user && listing && (
    user.id === listing.owner?._id || 
    user._id === listing.owner?._id || 
    user.id === listing.owner?.id || 
    user._id === listing.owner?.id || 
    user.id === listing.owner || 
    user._id === listing.owner
  );

  const handleDeleteListing = async () => {
    setHostActionLoading(true);
    setHostActionError("");
    try {
      await axios.delete(`/api/listings/${listingId}`);
      setIsDeleteConfirmOpen(false);
      showToast("Property deleted successfully!", "success");
      onBack();
    } catch (err) {
      console.error("Failed to delete listing:", err);
      setHostActionError(err.response?.data?.message || "Failed to delete property listing.");
    } finally {
      setHostActionLoading(false);
    }
  };

  const handleEditSuccess = (updatedListing) => {
    setListing(updatedListing);
    setIsEditModalOpen(false);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchListingData = async () => {
      setLoading(true);
      try {
        const [listingRes, datesRes] = await Promise.all([
          axios.get(`/api/listings/${listingId}`),
          axios.get(`/api/listings/${listingId}/availability`)
        ]);
        setListing(listingRes.data.listing);
        setBookedDates(datesRes.data.bookedDates || []);
      } catch (err) {
        console.error("Failed to load listing details:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListingData();
  }, [listingId]);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user) {
        setUserBookings([]);
        return;
      }
      setFetchingBookings(true);
      try {
        const res = await axios.get("/api/bookings/my-trips");
        setUserBookings(res.data.bookings || []);
      } catch (err) {
        console.error("Failed to fetch user bookings:", err.message);
      } finally {
        setFetchingBookings(false);
      }
    };
    fetchUserBookings();
  }, [user, listingId]);

  const handleCancelConfirm = async (bookingId) => {
    const res = await axios.post(`/api/bookings/${bookingId}/cancel`);
    // Refresh user bookings
    if (user) {
      const bookingsRes = await axios.get("/api/bookings/my-trips");
      setUserBookings(bookingsRes.data.bookings || []);
    }
    // Refresh availability dates
    const datesRes = await axios.get(`/api/listings/${listingId}/availability`);
    setBookedDates(datesRes.data.bookedDates || []);
    return res;
  };

  // Real Interactive Map initialization via Leaflet CDN global object window.L
  useEffect(() => {
    if (loading || !listing) return;

    let mapInstance = null;
    let intervalId = null;

    const initMap = () => {
      if (!window.L) return false;

      // Check map container exists in DOM before rendering
      const mapContainer = document.getElementById("map-container");
      if (!mapContainer) return false;

      // Leaflet geometry coordinates format: [longitude, latitude]
      const coords = listing.geometry?.coordinates || [77.2090, 28.6139]; // Default [Delhi Lng, Delhi Lat]
      const lat = coords[1];
      const lng = coords[0];

      // Initialize Map
      mapInstance = window.L.map("map-container", {
        center: [lat, lng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false // disable scrolling zoom to match Airbnb layout
      });

      // Add Tile Layer (OpenStreetMap vector tiles)
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapInstance);

      // Set custom icon to prevent Vite path resolution errors for Leaflet default assets
      const customIcon = window.L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Add Marker
      const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance);
      
      const price = showTax ? Math.round((listing.basePrice || listing.price) * 1.18) : (listing.basePrice || listing.price);

      // Add custom popup text with properties location
      marker.bindPopup(`
        <div style="font-family: var(--font-sans); text-align: left; min-width: 140px;">
          <h4 style="margin: 0 0 4px 0; font-weight: 800; font-size: 13px; color: #ff385c;">${localizedTitle}</h4>
          <p style="margin: 0; font-size: 11px; font-weight: 600; color: #64748b;">${listing.location}, ${listing.country}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 805; color: #0f172a;">&#8377; ${price.toLocaleString()} / night</p>
        </div>
      `).openPopup();

      // Trigger redraw to prevent grey tiles inside layout divs
      setTimeout(() => {
        if (mapInstance) {
          mapInstance.invalidateSize();
        }
      }, 250);

      return true;
    };

    const success = initMap();
    if (!success) {
      intervalId = setInterval(() => {
        if (window.L) {
          const checkSuccess = initMap();
          if (checkSuccess) {
            clearInterval(intervalId);
          }
        }
      }, 100);
    }

    // Clean up map container instance on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [listing, loading, showTax]);

  // Pricing Calculation
  const getPricingDetails = () => {
    if (!checkIn || !checkOut || !listing) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (start >= end) return null;
    
    const diffTime = Math.abs(end - start);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let baseTotal = 0;
    let curr = new Date(start);
    for (let i = 0; i < nights; i++) {
      const day = curr.getDay(); // 5 = Friday, 6 = Saturday
      const isWeekend = day === 5 || day === 6;
      const rate = isWeekend ? (listing.basePrice || listing.price) * 1.15 : (listing.basePrice || listing.price);
      baseTotal += rate;
      curr.setDate(curr.getDate() + 1);
    }
    
    const cleaning = listing.cleaningFee || 1000;
    const service = listing.serviceFee || 500;
    const grandTotal = Math.round(baseTotal + cleaning + service);

    return {
      nights,
      baseTotal: Math.round(baseTotal),
      cleaning,
      service,
      grandTotal
    };
  };

  const pricing = getPricingDetails();

  const activeBooking = userBookings.find(b => 
    b.listing && 
    (b.listing._id === listingId || b.listing === listingId) && 
    b.status === "confirmed"
  );

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to book properties!");
      return;
    }
    if (!pricing) return;
    setBookingError("");
    setBookingSuccess(false);
    setBookingLoading(true);

    try {
      // 1. Call backend to create Razorpay Order & temp booking
      const res = await axios.post("/api/payments/order", {
        listingId: listing._id,
        checkIn,
        checkOut
      });

      const { order, keyId, prefill } = res.data;

      // 2. Open official Razorpay Checkout Popup
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "AntiGravity Stays",
        description: `Booking for ${localizedTitle}`,
        image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=100",
        order_id: order.id,
        handler: async function (response) {
          // Triggered on payment success
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: prefill.name,
          email: prefill.email,
          contact: ""
        },
        theme: {
          color: "#ff385c" // AntiGravity brand color
        },
        modal: {
          ondismiss: async function () {
            // Triggered if user closes the popup without completing payment
            console.log("Razorpay payment modal closed by user.");
            setBookingLoading(false);
            try {
              await axios.post("/api/payments/failure", { orderId: order.id });
              showToast("Payment cancelled. Stay dates released.", "error");
            } catch (err) {
              console.error("Failed to call payment failure API:", err);
            }
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response) {
        console.error("Razorpay payment failed:", response.error);
        setBookingError(response.error.description || "Payment failed.");
        setBookingLoading(false);
        try {
          await axios.post("/api/payments/failure", { orderId: order.id });
        } catch (err) {
          console.error("Failed to log payment failure:", err);
        }
      });

      rzp.open();
    } catch (err) {
      setBookingError(err.response?.data?.message || "Failed to initiate payment order.");
      setBookingLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    setBookingLoading(true);
    setBookingError("");
    setBookingSuccess(false);
 
    try {
      // Send signatures to backend for secure verification and booking update
      await axios.post("/api/payments/verify", {
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_signature: paymentData.razorpay_signature
      });

      // Call payment success log endpoint (optional but keeps sequence clear)
      try {
        await axios.post("/api/payments/success", { orderId: paymentData.razorpay_order_id });
      } catch (logErr) {
        console.warn("Log success error:", logErr);
      }

      setBookingSuccess(true);
      showToast("Booking confirmed and stay reserved!", "success");
      setCheckIn("");
      setCheckOut("");
      
      // Reload listing details to block booked dates in calendar
      const datesRes = await axios.get(`/api/listings/${listingId}/availability`);
      setBookedDates(datesRes.data.bookedDates || []);
    } catch (err) {
      setBookingError(err.response?.data?.message || "Payment signature verification failed.");
      showToast("Verification failed. Please contact support.", "error");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Log in to submit a review!");
      return;
    }
    setReviewLoading(true);
    setReviewError("");

    try {
      const res = await axios.post(`/api/listings/${listing._id}/reviews`, {
        review: { rating, comment }
      });
      setListing(prev => ({
        ...prev,
        reviews: [...prev.reviews, res.data.review],
        averageRating: res.data.averageRating,
        reviewCount: res.data.reviewCount
      }));
      setComment("");
      setRating(5);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
          </div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const currentPrice = listing.basePrice || listing.price || 0;

  // Mock list of beautiful static details to make the page pop
  const features = [
    { icon: Wifi, title: "Superfast WiFi", desc: "Dedicated workspace with 250 Mbps connection." },
    { icon: ShieldCheck, title: "Self check-in", desc: "Check yourself in using the keyless smartlock." },
    { icon: Compass, title: "Gravity Index: Premium", desc: "Handpicked architectural highlight for outstanding design." },
    { icon: Coffee, title: "Gourmet Kitchen", desc: "Equipped with state of the art cooking accessories." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      
      {/* Premium Return Button */}
      <button 
        onClick={onBack}
        className="flex items-center space-x-2.5 text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-bold mb-6 group transition cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition duration-200" />
        <span>{t("detail.back")}</span>
      </button>

      {/* Main Grid Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          {localizedTitle}
        </h1>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs md:text-sm text-slate-550 dark:text-slate-400 font-bold">
          <div className="flex items-center text-slate-850 dark:text-slate-250">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1.5 shrink-0" />
            <span>{listing.averageRating > 0 ? listing.averageRating.toFixed(1) : "New"}</span>
            {listing.reviewCount > 0 && <span className="ml-1 font-medium text-slate-455">({listing.reviewCount} {listing.reviewCount === 1 ? t("detail.review") : t("detail.reviews")})</span>}
          </div>
          <span>&middot;</span>
          <div className="flex items-center hover:text-brand transition cursor-pointer">
            <MapPin className="h-4 w-4 mr-1.5 text-brand shrink-0" />
            <span>{listing.location}, {listing.country}</span>
          </div>
          <span className="hidden sm:inline">&middot;</span>
          <span className="bg-brand/10 dark:bg-brand/15 text-brand dark:text-brand-light px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
            {t(`categories.${listing.category}`)}
          </span>
        </div>
      </div>

      {/* Premium Image Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden mb-10 shadow-md">
        <div className="md:col-span-2 aspect-[4/3] md:aspect-auto md:h-[380px] overflow-hidden bg-slate-100 dark:bg-slate-850">
          <img 
            src={listing.image?.url || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200"} 
            alt={localizedTitle} 
            className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="hidden md:block col-span-1 h-[380px] overflow-hidden bg-slate-100 dark:bg-slate-850 space-y-3">
          <div className="h-[184px] w-full overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600" 
              alt="Luxury room mockup" 
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" 
            />
          </div>
          <div className="h-[184px] w-full overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600" 
              alt="Pool side mockup" 
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" 
            />
          </div>
        </div>
        <div className="hidden md:block col-span-1 h-[380px] overflow-hidden bg-slate-100 dark:bg-slate-850 space-y-3">
          <div className="h-[184px] w-full overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600" 
              alt="Living room mockup" 
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" 
            />
          </div>
          <div className="h-[184px] w-full overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600" 
              alt="Garden setup mockup" 
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" 
            />
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-14">
        
        {/* Left Columns (Details & Map) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Host Info Box */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200/50 dark:border-slate-800/40">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center">
                {t("detail.hosted_by", { name: listing.owner?.username || "Superhost" })}
                <CheckCircle className="h-5 w-5 text-indigo-500 ml-2 fill-indigo-500/10" />
              </h2>
              <p className="text-xs font-bold text-slate-450 dark:text-slate-500 mt-1 uppercase tracking-wider">
                {t("detail.verified_partner")}
              </p>
            </div>
            <img 
              src={listing.owner?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Host"} 
              alt="Host Avatar" 
              className="h-14 w-14 rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-slate-50 shadow-sm"
            />
          </div>

          {/* Premium Static Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="flex items-start p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl">
                  <Icon className="h-5 w-5 text-brand mr-3.5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{feat.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-0.5 leading-normal">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Space Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-150">{t("detail.about")}</h3>
            <p className="text-slate-650 dark:text-slate-300 leading-relaxed text-xs sm:text-sm whitespace-pre-line font-bold">
              {localizedDesc}
            </p>
          </div>

          {/* Dynamic Location Neighbourhood Description */}
          {localizedLocationDesc && (
            <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/40 space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-150">{t("detail.location_description")}</h3>
              <p className="text-slate-650 dark:text-slate-300 leading-relaxed text-xs sm:text-sm whitespace-pre-line font-bold">
                {localizedLocationDesc}
              </p>
            </div>
          )}

          {/* Dynamic Amenities from DB */}
          {localizedAmenities && (
            <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/40 space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-150">{t("detail.amenities")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-bold text-slate-650 dark:text-slate-350">
                {localizedAmenities.split(",").map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{item.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic House Rules from DB */}
          {localizedRules && (
            <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/40 space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-150">{t("detail.house_rules")}</h3>
              <p className="text-slate-650 dark:text-slate-300 leading-relaxed text-xs sm:text-sm whitespace-pre-line font-bold">
                {localizedRules}
              </p>
            </div>
          )}

          {/* Map Section */}
          <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/40">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-150 mb-4">{t("detail.where_will_be")}</h3>
            <div 
              id="map-container" 
              className="h-80 w-full rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-inner z-10"
            ></div>
          </div>

        </div>

        {/* Right Column (Checkout/Reservation Card) */}
        <div className="relative">
          <div className="sticky top-24 glass-panel p-6 border border-slate-200/65 dark:border-slate-800/50 rounded-3xl shadow-xl space-y-5">
            
            {/* Price tag header */}
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">&#8377;{(showTax ? Math.round(currentPrice * 1.18) : currentPrice).toLocaleString()}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-450 font-bold uppercase tracking-wider">{t("detail.night")}</span>
                </div>
                {showTax ? (
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5 uppercase tracking-wider">{t("detail.includes_gst")}</span>
                ) : (
                  <span className="text-[9px] text-slate-400 dark:text-slate-550 font-semibold block mt-0.5 uppercase tracking-wider">{t("detail.excludes_gst")}</span>
                )}
              </div>
              <div className="flex items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1 shrink-0" />
                <span>{listing.averageRating > 0 ? listing.averageRating.toFixed(1) : "New"}</span>
              </div>
            </div>

            {isOwner && (
              <div className="bg-slate-950/40 border border-slate-200/20 dark:border-slate-800/40 p-4 rounded-2xl text-center space-y-3.5 animate-fade-in mb-3">
                <div className="flex items-center justify-between">
                  <span className="bg-brand/10 text-brand border border-brand/20 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" /> {t("detail.host_mode")}
                  </span>
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">{t("detail.you_own")}</span>
                </div>
                
                {hostActionError && (
                  <div className="p-2.5 bg-red-955/25 border border-red-900/30 text-red-400 rounded-xl text-[10px] font-bold">
                    {hostActionError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider cursor-pointer active:scale-95 transition flex items-center justify-center space-x-1.5"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>{t("detail.edit_details")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="py-2.5 bg-gradient-to-r from-red-650 to-rose-700 hover:from-red-700 hover:to-rose-850 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider cursor-pointer active:scale-95 transition flex items-center justify-center space-x-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{t("detail.delete_listing")}</span>
                  </button>
                </div>
              </div>
            )}

            {activeBooking ? (
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center space-y-4 animate-fade-in">
                <div className="flex flex-col items-center">
                  <span className="bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider mb-2">
                    {t("detail.confirmed_trip")}
                  </span>
                  <p className="font-extrabold text-xs text-white uppercase tracking-wider">{t("detail.stay_reserved")}</p>
                  <p className="text-[9px] text-slate-455 mt-1 uppercase tracking-widest">ID: {activeBooking._id.substring(18)}</p>
                </div>
                
                <div className="border border-slate-850 rounded-xl p-3 bg-slate-950/50 space-y-2.5 text-xs text-left">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-450 uppercase text-[9px] tracking-wider">{t("detail.check_in")}</span>
                    <span className="text-slate-200">{new Date(activeBooking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-455 uppercase text-[9px] tracking-wider">{t("detail.check_out")}</span>
                    <span className="text-slate-200">{new Date(activeBooking.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-850 pt-2">
                    <span className="text-slate-450 uppercase text-[9px] tracking-wider">{t("detail.total_price")}</span>
                    <span className="text-brand font-extrabold">&#8377;{activeBooking.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-455 uppercase text-[9px] tracking-wider">{t("detail.status")}</span>
                    <span className="text-emerald-450 font-black uppercase text-[10px] tracking-wide">{activeBooking.paymentStatus === 'paid' ? t("detail.paid") : t("detail.pending")}</span>
                  </div>
                </div>

                {/* Cancel Booking Action */}
                {(() => {
                  const bookingTime = new Date(activeBooking.createdAt);
                  const now = new Date();
                  const diffHours = (now - bookingTime) / (1000 * 60 * 60);
                  const isCancelable = user?.role === "admin" || diffHours <= 24;

                  return isCancelable ? (
                    <button
                      onClick={() => setCancelModalOpen(true)}
                      className="w-full py-3.5 bg-gradient-to-r from-red-650 to-rose-700 hover:from-red-750 hover:to-rose-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition shadow-lg shadow-red-950/20"
                    >
                      {t("detail.cancel_reservation")}
                    </button>
                  ) : (
                    <div className="text-[9px] text-red-500 font-extrabold uppercase bg-red-955/10 border border-red-900/20 py-2.5 rounded-xl text-center tracking-wider">
                      {t("detail.refund_expired")}
                    </div>
                  );
                })()}
              </div>
            ) : bookingSuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 p-5 rounded-2xl text-center space-y-2.5 animate-bounce">
                <p className="font-extrabold text-sm">Booking Confirmed!</p>
                <p className="text-[11px] leading-relaxed font-semibold">Your reservation is confirmed. Visit the Trips & Bookings Dashboard to check status.</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-4">
                
                {/* Date Fields */}
                <div className="grid grid-cols-2 gap-2 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] uppercase font-extrabold text-slate-400 dark:text-slate-550 mb-0.5 tracking-wider">{t("detail.check_in")}</label>
                    <input 
                      type="date" 
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-200 font-bold w-full cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col text-left border-l border-slate-200 dark:border-slate-800 pl-3">
                    <label className="text-[9px] uppercase font-extrabold text-slate-400 dark:text-slate-555 mb-0.5 tracking-wider">{t("detail.check_out")}</label>
                    <input 
                      type="date" 
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-200 font-bold w-full cursor-pointer"
                    />
                  </div>
                </div>

                {/* Price Calculations */}
                {pricing && (
                  <div className="space-y-3.5 text-xs text-slate-650 dark:text-slate-350 border-t border-slate-200/50 dark:border-slate-800/40 pt-4 animate-fade-in">
                    <div className="flex justify-between font-medium">
                      <span>&#8377;{currentPrice.toLocaleString()} x {pricing.nights} nights</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">&#8377;{pricing.baseTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-450 dark:text-slate-555 font-semibold uppercase tracking-wider">
                      <span>Weekend surcharge (15% Fri/Sat)</span>
                      <span>Included</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Cleaning fee</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">&#8377;{pricing.cleaning.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Service fee</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">&#8377;{pricing.service.toLocaleString()}</span>
                    </div>
                    <hr className="border-slate-200/50 dark:border-slate-800/45" />
                    <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      <span>{t("detail.total_price")}</span>
                      <span className="text-brand dark:text-brand-light">&#8377;{pricing.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {bookingError && (
                  <div className="flex items-center text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-955/20 p-3.5 rounded-2xl border border-red-100 dark:border-red-900">
                    <ShieldAlert className="h-4 w-4 mr-2 shrink-0" />
                    <span className="leading-tight font-bold">{bookingError}</span>
                  </div>
                )}

                {/* Glowing button */}
                <button
                  type="submit"
                  disabled={bookingLoading || !pricing}
                  className="w-full py-3.5 bg-gradient-to-r from-brand to-pink-650 hover:from-brand-dark hover:to-pink-700 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-850 dark:disabled:to-slate-850 disabled:text-slate-400 dark:disabled:text-slate-650 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl shadow-lg hover:shadow-brand/10 transition-all duration-300 cursor-pointer text-xs uppercase tracking-wider"
                >
                  {bookingLoading ? t("detail.confirming_space") : pricing ? t("detail.reserve") : t("detail.select_date")}
                </button>
              </form>
            )}
            
            <p className="text-center text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-bold">
              {t("detail.not_charged")}
            </p>
          </div>
        </div>

      </div>

      {/* Reviews Section */}
      <div className="border-t border-slate-200/60 dark:border-slate-800/40 pt-10">
        
        {/* Review Headers */}
        <div className="flex items-center space-x-2 text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-8 tracking-tight">
          <Star className="h-5.5 w-5.5 fill-amber-400 text-amber-400 shrink-0" />
          <span>{listing.averageRating > 0 ? listing.averageRating.toFixed(1) : "New"}</span>
          <span className="text-slate-300 dark:text-slate-800">&middot;</span>
          <span>{listing.reviews?.length || 0} {listing.reviews?.length === 1 ? t("detail.review") : t("detail.reviews")}</span>
        </div>

        {/* Existing Reviews */}
        {listing.reviews?.length === 0 ? (
          <p className="text-slate-455 text-xs font-bold uppercase tracking-wider italic mb-8">{t("detail.no_reviews")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {listing.reviews.map((rev) => (
              <div key={rev._id} className="bg-white dark:bg-slate-900/60 p-5 border border-slate-200/50 dark:border-slate-800/35 rounded-3xl flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center space-x-3.5 mb-3.5">
                    <img 
                      src={rev.author?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Reviewer"} 
                      alt="Reviewer Avatar" 
                      className="h-9 w-9 rounded-xl border border-slate-200/40 dark:border-slate-800 bg-slate-50 object-cover shadow-sm"
                    />
                    <div>
                      <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{rev.author?.username || "Guest"}</p>
                      <div className="flex space-x-0.5 mt-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                    {rev.comment}
                  </p>
                </div>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-4">
                  {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Submit Review */}
        {user ? (
          <form onSubmit={handleAddReview} className="glass-panel p-6 sm:p-8 border border-slate-250/50 dark:border-slate-800/40 rounded-3xl max-w-xl space-y-5">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base md:text-lg">{t("detail.write_review")}</h4>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs font-extrabold text-slate-450 dark:text-slate-555 uppercase tracking-wider">{t("detail.your_rating")}</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-125 transition-transform cursor-pointer"
                  >
                    <Star className={`h-5 w-5 transition duration-200 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <textarea
                required
                rows={4}
                placeholder={t("detail.comment_placeholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-4 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-brand dark:focus:border-indigo-500 transition-colors font-bold leading-relaxed"
              />
            </div>

            {reviewError && (
              <p className="text-xs text-red-500 font-bold">{reviewError}</p>
            )}

            <button
              type="submit"
              disabled={reviewLoading}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-850 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-md hover:scale-103 active:scale-97 transition-all flex items-center cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 mr-2 shrink-0" /> {reviewLoading ? t("detail.submitting_review") : t("detail.submit_review")}
            </button>
          </form>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900/40 p-5 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center max-w-md">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {t("detail.login_to_review")}
            </p>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <CancelBookingModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        booking={activeBooking}
        onConfirm={handleCancelConfirm}
      />

      {/* Listing Create/Edit Form Modal */}
      {listing && (
        <ListingFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          listing={listing}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl rounded-3xl p-6 sm:p-8 max-w-md w-full animate-scale-up">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/50 pb-3">
              Delete Property?
            </h3>
            <p className="text-xs text-slate-655 dark:text-slate-400 font-bold leading-relaxed mt-4">
              Are you sure you want to delete <span className="font-extrabold text-slate-850 dark:text-white">"{localizedTitle}"</span>? 
            </p>
            <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-955/10 border border-rose-250 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 rounded-2xl text-[10px] font-bold leading-normal flex items-start">
              <span className="mr-2">⚠️</span>
              <span>Warning: This action is permanent. All reservations and reviews associated with this listing will be deleted immediately.</span>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={hostActionLoading}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-[10px] font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
              >
                Keep Listing
              </button>
              <button
                onClick={handleDeleteListing}
                disabled={hostActionLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-red-650 to-rose-700 hover:from-red-750 hover:to-rose-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[100px] cursor-pointer shadow-lg shadow-red-950/20"
              >
                {hostActionLoading ? (
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Confirm Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
