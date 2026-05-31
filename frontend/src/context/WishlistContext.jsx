import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user, setUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Sync state with user profile loading
  useEffect(() => {
    if (user && user.wishlist) {
      setWishlist(user.wishlist);
    } else {
      setWishlist([]);
    }
  }, [user]);

  const toggleWishlist = async (listingId) => {
    if (!user) {
      alert("Please login to wishlist properties!");
      return;
    }
    try {
      const res = await axios.post(`/api/users/wishlist/${listingId}`);
      setWishlist(res.data.wishlist);
      // Update user context as well
      setUser(prev => prev ? { ...prev, wishlist: res.data.wishlist } : null);
    } catch (err) {
      console.error("Failed to toggle wishlist item:", err.message);
    }
  };

  const inWishlist = (listingId) => {
    return wishlist.some(item => (typeof item === "string" ? item === listingId : item._id === listingId));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, inWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
