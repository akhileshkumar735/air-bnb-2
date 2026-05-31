import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Upload, Home, DollarSign, MapPin, Globe, Compass } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function ListingFormModal({ isOpen, onClose, listing = null, onSuccess }) {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [cleaningFee, setCleaningFee] = useState("");
  const [serviceFee, setServiceFee] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("Beach");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "Beach", "Mountain", "Historic", "Treehouse", "Desert", 
    "City", "Castle", "Pool", "Countryside", "Lakefront"
  ];

  // Populate form if editing an existing listing
  useEffect(() => {
    if (listing) {
      setTitle(listing.title || "");
      setDescription(listing.description || "");
      setBasePrice(listing.basePrice || listing.price || "");
      setCleaningFee(listing.cleaningFee || "0");
      setServiceFee(listing.serviceFee || "0");
      setLocation(listing.location || "");
      setCountry(listing.country || "");
      setCategory(listing.category || "Beach");
      setImageFile(null);
      setImagePreview(listing.image?.url || null);
    } else {
      // Clear form for creation
      setTitle("");
      setDescription("");
      setBasePrice("");
      setCleaningFee("0");
      setServiceFee("0");
      setLocation("");
      setCountry("");
      setCategory("Beach");
      setImageFile(null);
      setImagePreview(null);
    }
    setError("");
  }, [listing, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("basePrice", Number(basePrice));
      formData.append("price", Number(basePrice)); // standard Joi schema compat
      formData.append("cleaningFee", Number(cleaningFee) || 0);
      formData.append("serviceFee", Number(serviceFee) || 0);
      formData.append("location", location);
      formData.append("country", country);
      formData.append("category", category);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      let res;
      if (listing) {
        // Edit existing listing
        res = await axios.put(`/api/listings/${listing._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showToast("Listing updated successfully!", "success");
      } else {
        // Create new listing
        res = await axios.post("/api/listings", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showToast("Listing created successfully!", "success");
      }

      onSuccess(res.data.listing);
      onClose();
    } catch (err) {
      console.error("Listing action failed:", err);
      setError(err.response?.data?.message || "Something went wrong. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl rounded-3xl p-6 sm:p-8 animate-scale-up text-left">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-6 flex items-center space-x-3">
          <div className="p-2.5 bg-brand/10 text-brand rounded-2xl">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {listing ? "Edit Property Listing" : "Host a New Property"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-bold">
              {listing ? "Update details of your property listing" : "Earn income by listing your place with AntiGravity"}
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Property Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Luxury Beachside Villa in Goa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Description</label>
            <textarea 
              rows="3"
              required
              placeholder="Provide a stunning description of the property, its views, and nearby locations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition resize-none"
            />
          </div>

          {/* Grid pricing and fees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center">
                <DollarSign className="h-3.5 w-3.5 mr-0.5 shrink-0" /> Base Price (₹)
              </label>
              <input 
                type="number" 
                required
                min="0"
                placeholder="Per night price"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Cleaning Fee (₹)</label>
              <input 
                type="number" 
                min="0"
                placeholder="Cleaning cost"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Service Fee (₹)</label>
              <input 
                type="number" 
                min="0"
                placeholder="Platform fee"
                value={serviceFee}
                onChange={(e) => setServiceFee(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition"
              />
            </div>
          </div>

          {/* Grid locations and category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-0.5 shrink-0" /> City / Location
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. North Goa"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center">
                <Globe className="h-3.5 w-3.5 mr-0.5 shrink-0" /> Country
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center">
                <Compass className="h-3.5 w-3.5 mr-0.5 shrink-0" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-250 font-semibold">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Uploader */}
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Property Image</label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30">
              {imagePreview ? (
                <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/40">
                  <Upload className="h-6 w-6 text-slate-400" />
                </div>
              )}
              
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Upload a listing cover photo</p>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">JPEG, PNG or WEBP formats supported.</p>
                <label className="inline-block mt-3 px-4 py-2 bg-slate-150 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-750 dark:text-slate-200 rounded-xl cursor-pointer transition">
                  Choose File
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-2xl text-xs font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-brand to-brand-dark text-white rounded-2xl text-xs font-black uppercase tracking-wider transition active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[120px] shadow-lg shadow-brand/10 cursor-pointer"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                listing ? "Update Listing" : "Create Listing"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
