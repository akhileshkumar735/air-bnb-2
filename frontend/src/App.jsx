import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { WishlistProvider, useWishlist } from "./context/WishlistContext";
import { TaxProvider } from "./context/TaxContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Home from "./pages/Home";
import ListingDetail from "./pages/ListingDetail";
import UserProfile from "./pages/UserProfile";
import UserDashboard from "./pages/UserDashboard";
import HostDashboard from "./pages/HostDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import EmptyState from "./components/EmptyState";
import PropertyCard from "./components/PropertyCard";
import { Heart } from "lucide-react";

function AppContent() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState("home"); // home, wishlist, profile, guest-dashboard, host-dashboard, login, signup, listing-detail
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [searchParams, setSearchParams] = useState({ q: "", guests: 1 });
  const [searchTriggered, setSearchTriggered] = useState(false);

  const handleSelectListing = (id) => {
    setSelectedListingId(id);
    setActiveTab("listing-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (params) => {
    setSearchParams(params);
    setActiveTab("home");
  };

  const handleClearSearch = () => {
    setSearchParams({ q: "", guests: 1 });
  };

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            <Hero onSearch={handleSearch} />
            <Home 
              searchParams={searchParams} 
              onClearSearch={handleClearSearch} 
              onSelectListing={handleSelectListing} 
            />
          </>
        );
      case "listing-detail":
        return (
          <ListingDetail 
            listingId={selectedListingId} 
            onBack={() => setActiveTab("home")} 
          />
        );
      case "profile":
        return user ? <UserProfile /> : <Login onToggleAuth={() => setActiveTab("signup")} onBackToHome={() => setActiveTab("home")} />;
      case "guest-dashboard":
        return user ? <UserDashboard onSelectListing={handleSelectListing} /> : <Login onToggleAuth={() => setActiveTab("signup")} onBackToHome={() => setActiveTab("home")} />;
      case "host-dashboard":
        return user ? <HostDashboard onSelectListing={handleSelectListing} /> : <Login onToggleAuth={() => setActiveTab("signup")} onBackToHome={() => setActiveTab("home")} />;
      case "login":
        return (
          <Login 
            onToggleAuth={() => setActiveTab("signup")} 
            onBackToHome={() => setActiveTab("home")} 
          />
        );
      case "signup":
        return (
          <Signup 
            onToggleAuth={() => setActiveTab("login")} 
            onBackToHome={() => setActiveTab("home")} 
          />
        );
      case "wishlist":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[500px]">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center mb-6">
              <Heart className="h-6 w-6 text-brand fill-brand mr-2" /> Wishlist
            </h2>
            {wishlist.length === 0 ? (
              <EmptyState 
                title="Wishlist is empty" 
                subtitle="Save your favorite properties by clicking the heart icon on search results."
                actionLabel="Explore properties"
                onAction={() => setActiveTab("home")}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlist.map((listing) => (
                  <PropertyCard 
                    key={listing._id} 
                    listing={listing} 
                    onClick={handleSelectListing} 
                  />
                ))}
              </div>
            )}
          </div>
        );
      default:
        return <NotFound onGoHome={() => setActiveTab("home")} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navbar */}
      <Navbar 
        onSearchTrigger={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Page Layout */}
      <div className="flex-grow">
        {renderPage()}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <TaxProvider>
            <AppContent />
          </TaxProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
