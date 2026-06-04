import React, { useState, useEffect } from "react";
import axios from "axios";
import Categories from "../components/Categories";
import PropertyCard from "../components/PropertyCard";
import EmptyState from "../components/EmptyState";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTax } from "../context/TaxContext";
import { useTranslation } from "react-i18next";
import { useSEO } from "../hooks/useSEO";

export default function Home({ searchParams, onClearSearch, onSelectListing }) {
  const { t, i18n } = useTranslation();
  useSEO({
    title: t("home.title"),
    description: t("home.subtitle"),
    pathname: "/"
  });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMapView, setShowMapView] = useState(false);
  const { showTax } = useTax();
  const limit = 12;

  // Set global handleMapListingClick callback
  useEffect(() => {
    window.handleMapListingClick = (id) => {
      onSelectListing(id);
    };
    return () => {
      delete window.handleMapListingClick;
    };
  }, [onSelectListing]);

  // Polling initialization for Leaflet Map
  useEffect(() => {
    if (!showMapView || loading || listings.length === 0) return;

    let mapInstance = null;
    let intervalId = null;

    const initHomeMap = () => {
      if (!window.L) return false;

      const mapContainer = document.getElementById("home-map-container");
      if (!mapContainer) return false;

      // Calculate center of map or fit bounds
      const bounds = listings.map((l) => {
        const coords = l.geometry?.coordinates || [77.2090, 28.6139];
        return [coords[1], coords[0]];
      });

      const defaultCenter = bounds.length > 0 ? bounds[0] : [28.6139, 77.2090];

      mapInstance = window.L.map("home-map-container", {
        center: defaultCenter,
        zoom: 10,
        zoomControl: true,
        scrollWheelZoom: true
      });

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapInstance);

      // Add Price-Pill Markers
      listings.forEach((listing) => {
        const coords = listing.geometry?.coordinates || [77.2090, 28.6139];
        const lat = coords[1];
        const lng = coords[0];

        const currentLang = i18n.language || "en";
        const titleVal = listing.title?.[currentLang] || listing.title?.en || listing.title || "";

        const price = showTax ? Math.round(listing.basePrice * 1.18) : listing.basePrice;
        const priceHtml = `<div class="price-marker-pill">&#8377;${price.toLocaleString()}</div>`;
        
        const priceIcon = window.L.divIcon({
          html: priceHtml,
          className: "custom-price-marker",
          iconSize: [65, 26],
          iconAnchor: [32, 13],
          popupAnchor: [0, -10]
        });

        const marker = window.L.marker([lat, lng], { icon: priceIcon }).addTo(mapInstance);

        const popupContent = `
          <div style="font-family: var(--font-sans); width: 180px; text-align: left; cursor: pointer;" onclick="window.handleMapListingClick('${listing._id}')">
            <img src="${listing.image?.url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300'}" alt="${titleVal}" style="height: 100px; width: 100%; object-fit: cover; border-radius: 12px; margin-bottom: 8px;" />
            <h4 style="margin: 0 0 2px 0; font-weight: 800; font-size: 12px; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${titleVal}</h4>
            <p style="margin: 0; font-size: 10px; font-weight: 650; color: #64748b;">${listing.location}, ${listing.country}</p>
            <div style="display: flex; align-items: center; margin-top: 6px; margin-bottom: 6px;">
              <span style="font-weight: 800; font-size: 12.5px; color: #ff385c;">&#8377; ${price.toLocaleString()}</span>
              <span style="font-size: 10px; font-weight: 700; color: #475569; margin-left: auto;">★ ${listing.averageRating > 0 ? listing.averageRating.toFixed(1) : 'New'}</span>
            </div>
            <div style="margin-top: 6px; text-align: center; background-color: #ff385c; color: white; padding: 6px; border-radius: 8px; font-size: 10px; font-weight: bold; transition: background-color 0.2s;">View Details</div>
          </div>
        `;

        marker.bindPopup(popupContent);
      });

      if (bounds.length > 0) {
        try {
          mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        } catch (e) {
          console.warn("Could not fit map bounds:", e.message);
        }
      }

      // Recompute size to prevent gray tiles
      setTimeout(() => {
        if (mapInstance) {
          mapInstance.invalidateSize();
        }
      }, 250);

      return true;
    };

    const success = initHomeMap();
    if (!success) {
      intervalId = setInterval(() => {
        if (window.L) {
          const checkSuccess = initHomeMap();
          if (checkSuccess) clearInterval(intervalId);
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (mapInstance) mapInstance.remove();
    };
  }, [showMapView, listings, loading, showTax]);

  // Reset page when category or search changes
  useEffect(() => {
    setPage(1);
  }, [category, searchParams]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          category,
          ...searchParams
        };
        const res = await axios.get("/api/listings", { params });
        setListings(res.data.listings);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch listings:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [page, category, searchParams]);

  const handleClearAll = () => {
    setCategory("");
    onClearSearch();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Category Scroll Filter */}
      <Categories selectedCategory={category} onSelectCategory={setCategory} />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative">
        {loading ? (
          // Skeleton Loading Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="flex flex-col space-y-3 animate-pulse">
                <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-neutral-800 rounded-2xl"></div>
                <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-1/3 mt-2"></div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          // Empty State
          <EmptyState onAction={handleClearAll} />
        ) : showMapView ? (
          // Real Airbnb-Style Leaflet Map view
          <div className="w-full h-[65vh] md:h-[75vh] rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-lg relative z-10">
            <div id="home-map-container" className="w-full h-full"></div>
          </div>
        ) : (
          <>
            {/* Listing Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <PropertyCard 
                  key={listing._id} 
                  listing={listing} 
                  onClick={onSelectListing} 
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-12 py-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="p-2 border border-gray-200 dark:border-neutral-800 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-transparent transition cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                 <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("home.page_info", { page, totalPages })}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="p-2 border border-gray-200 dark:border-neutral-800 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-transparent transition cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Toggle Button */}
      {!loading && listings.length > 0 && (
        <button 
          onClick={() => setShowMapView(prev => !prev)}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-3.5 rounded-full flex items-center space-x-2.5 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-bold text-xs uppercase tracking-wider border border-white/10 dark:border-slate-200"
        >
          {showMapView ? (
            <>
              <span>{t("home.show_list")}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-brand">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </>
          ) : (
            <>
              <span>{t("home.show_map")}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-brand">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8m-6-1.5h.008v.008H9v-.008zm6-3h.008v.008H15v-.008zm6-3h.008v.008H21V6.25zm0 6h.008v.008H21v-.008zm-18-6h.008v.008H3V6.25zm0 6h.008v.008H3v-.008zm0 6h.008v.008H3v-.008z" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}
