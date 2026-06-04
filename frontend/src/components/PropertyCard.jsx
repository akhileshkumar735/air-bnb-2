import React from "react";
import { Star, Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useTax } from "../context/TaxContext";
import { useTranslation } from "react-i18next";

export default function PropertyCard({ listing, onClick }) {
  const { t, i18n } = useTranslation();
  const { toggleWishlist, inWishlist } = useWishlist();
  const { showTax } = useTax();
  
  const isFav = inWishlist(listing._id);
  const displayPrice = showTax ? Math.round(listing.basePrice * 1.18) : listing.basePrice;
  const currentLang = i18n.language || "en";

  // Fallback to English title if translation is not available
  const localizedTitle = listing.title?.[currentLang] || listing.title?.en || listing.title || "";

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(listing._id);
  };

  return (
    <div 
      onClick={() => onClick(listing._id)}
      className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/40 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5"
    >
      {/* Listing Image Container with Zoom and Overlay */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-855">
        <img 
          src={listing.image?.url || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600"} 
          alt={localizedTitle} 
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Soft bottom gradient overlay inside image to ensure contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Premium Category Tag */}
        <span className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-white/20">
          {t(`categories.${listing.category}`)}
        </span>

        {/* Heart Wishlist overlay with click bumper scaling */}
        <button 
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 dark:bg-slate-900/75 backdrop-blur-md hover:bg-white dark:hover:bg-slate-900 hover:scale-105 active:scale-90 transition-all shadow-md group/heart border border-white/20"
          aria-label="Toggle Wishlist"
        >
          <Heart 
            className={`h-4.5 w-4.5 transition duration-300 ${
              isFav 
                ? "fill-brand text-brand scale-110 animate-pulse-slow" 
                : "text-slate-600 dark:text-slate-400 group-hover/heart:text-slate-800 dark:group-hover/heart:text-slate-200"
            }`} 
          />
        </button>
      </div>

      {/* Listing Details Layout */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 truncate text-[15px] max-w-[80%] tracking-tight">
            {listing.location}, {listing.country}
          </h4>
          <div className="flex items-center text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 mr-1 shrink-0" />
            <span>{listing.averageRating > 0 ? listing.averageRating.toFixed(1) : "New"}</span>
          </div>
        </div>

        <p className="text-xs text-slate-505 dark:text-slate-400 line-clamp-2 min-h-[32px] mb-4 font-bold">
          {localizedTitle}
        </p>

        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-base font-extrabold text-brand dark:text-brand-light">&#8377;{displayPrice.toLocaleString()}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("detail.night")}</span>
            </div>
            {showTax ? (
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5 uppercase tracking-wider">{t("detail.includes_gst")}</span>
            ) : (
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block mt-0.5 uppercase tracking-wider">{t("detail.excludes_gst")}</span>
            )}
          </div>
          {listing.reviewCount > 0 && (
            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200/20">
              {listing.reviewCount} {listing.reviewCount === 1 ? t("detail.review") : t("detail.reviews")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
