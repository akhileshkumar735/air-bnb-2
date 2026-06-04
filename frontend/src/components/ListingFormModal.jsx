import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Upload, Home, DollarSign, MapPin, Globe, Compass, Check } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";

export default function ListingFormModal({ isOpen, onClose, listing = null, onSuccess }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  // Tab selector for editing multiple language values
  const [activeLangTab, setActiveLangTab] = useState("en");

  // Localized states matching the new MongoDB Listing structure
  const [title, setTitle] = useState({ en: "", hi: "", fr: "", es: "" });
  const [description, setDescription] = useState({ en: "", hi: "", fr: "", es: "" });
  const [amenities, setAmenities] = useState({ en: "", hi: "", fr: "", es: "" });
  const [houseRules, setHouseRules] = useState({ en: "", hi: "", fr: "", es: "" });
  const [locationDescription, setLocationDescription] = useState({ en: "", hi: "", fr: "", es: "" });

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

  const languageTabs = [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi (हिन्दी)" },
    { code: "fr", label: "French (Français)" },
    { code: "es", label: "Spanish (Español)" }
  ];

  // Populate form if editing an existing listing
  useEffect(() => {
    if (listing) {
      setTitle({
        en: listing.title?.en || listing.title || "",
        hi: listing.title?.hi || "",
        fr: listing.title?.fr || "",
        es: listing.title?.es || ""
      });
      setDescription({
        en: listing.description?.en || listing.description || "",
        hi: listing.description?.hi || "",
        fr: listing.description?.fr || "",
        es: listing.description?.es || ""
      });
      setAmenities({
        en: listing.amenities?.en || listing.amenities || "",
        hi: listing.amenities?.hi || "",
        fr: listing.amenities?.fr || "",
        es: listing.amenities?.es || ""
      });
      setHouseRules({
        en: listing.houseRules?.en || listing.houseRules || "",
        hi: listing.houseRules?.hi || "",
        fr: listing.houseRules?.fr || "",
        es: listing.houseRules?.es || ""
      });
      setLocationDescription({
        en: listing.locationDescription?.en || listing.locationDescription || "",
        hi: listing.locationDescription?.hi || "",
        fr: listing.locationDescription?.fr || "",
        es: listing.locationDescription?.es || ""
      });

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
      setTitle({ en: "", hi: "", fr: "", es: "" });
      setDescription({ en: "", hi: "", fr: "", es: "" });
      setAmenities({ en: "", hi: "", fr: "", es: "" });
      setHouseRules({ en: "", hi: "", fr: "", es: "" });
      setLocationDescription({ en: "", hi: "", fr: "", es: "" });

      setBasePrice("");
      setCleaningFee("0");
      setServiceFee("0");
      setLocation("");
      setCountry("");
      setCategory("Beach");
      setImageFile(null);
      setImagePreview(null);
    }
    setActiveLangTab("en");
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
      
      // Append nested localized fields
      formData.append("listing[title][en]", title.en);
      formData.append("listing[title][hi]", title.hi);
      formData.append("listing[title][fr]", title.fr);
      formData.append("listing[title][es]", title.es);

      formData.append("listing[description][en]", description.en);
      formData.append("listing[description][hi]", description.hi);
      formData.append("listing[description][fr]", description.fr);
      formData.append("listing[description][es]", description.es);

      formData.append("listing[amenities][en]", amenities.en);
      formData.append("listing[amenities][hi]", amenities.hi);
      formData.append("listing[amenities][fr]", amenities.fr);
      formData.append("listing[amenities][es]", amenities.es);

      formData.append("listing[houseRules][en]", houseRules.en);
      formData.append("listing[houseRules][hi]", houseRules.hi);
      formData.append("listing[houseRules][fr]", houseRules.fr);
      formData.append("listing[houseRules][es]", houseRules.es);

      formData.append("listing[locationDescription][en]", locationDescription.en);
      formData.append("listing[locationDescription][hi]", locationDescription.hi);
      formData.append("listing[locationDescription][fr]", locationDescription.fr);
      formData.append("listing[locationDescription][es]", locationDescription.es);

      formData.append("listing[location]", location);
      formData.append("listing[country]", country);
      formData.append("listing[category]", category);
      formData.append("listing[basePrice]", Number(basePrice));
      formData.append("listing[price]", Number(basePrice)); // standard Joi schema compat
      formData.append("listing[cleaningFee]", Number(cleaningFee) || 0);
      formData.append("listing[serviceFee]", Number(serviceFee) || 0);

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
      setError(err.response?.data?.message || t("form.validation_error") || "Something went wrong. Please check your inputs.");
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
              {listing ? t("form.edit_title") : t("form.create_title")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-bold">
              {listing ? t("form.edit_subtitle") : t("form.create_subtitle")}
            </p>
          </div>
        </div>

        {/* Language Tabs switcher */}
        <div className="mb-6 flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none">
          {languageTabs.map((tab) => {
            const isSelected = activeLangTab === tab.code;
            const hasValue = !!title[tab.code] && !!description[tab.code];
            return (
              <button
                key={tab.code}
                type="button"
                onClick={() => setActiveLangTab(tab.code)}
                className={`py-3 px-4 text-xs font-black uppercase tracking-wider cursor-pointer whitespace-nowrap transition-all flex items-center space-x-1.5 border-b-2 ${
                  isSelected 
                    ? "border-brand text-brand" 
                    : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                }`}
              >
                <span>{tab.label}</span>
                {hasValue && <Check className="h-3.5 w-3.5 text-emerald-500" />}
              </button>
            );
          })}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-955/20 border border-red-200/50 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Grouped Localized Fields (Dynamic based on selected language tab) */}
          <div className="space-y-5 p-4.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/30 rounded-3xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-brand tracking-widest bg-brand/10 px-2.5 py-1 rounded-lg">
                Editing: {languageTabs.find(t => t.code === activeLangTab)?.label} Details
              </span>
              {activeLangTab !== "en" && (
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold italic">
                  * Leave empty to auto-translate from English
                </span>
              )}
            </div>

            {/* Title Input */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                {activeLangTab === "en" ? t("form.prop_title_en") : t(`form.prop_title_${activeLangTab}`)}
              </label>
              <input 
                type="text" 
                required={activeLangTab === "en"}
                placeholder={activeLangTab === "en" ? "e.g. Luxury Beachside Villa in Goa" : "Translation (Optional)"}
                value={title[activeLangTab]}
                onChange={(e) => setTitle({ ...title, [activeLangTab]: e.target.value })}
                className="px-4 py-3 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition"
              />
            </div>

            {/* Description Input */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                {activeLangTab === "en" ? t("form.desc_en") : t(`form.desc_${activeLangTab}`)}
              </label>
              <textarea 
                rows="3"
                required={activeLangTab === "en"}
                placeholder={activeLangTab === "en" ? "Provide a stunning description of the property..." : "Translation (Optional)"}
                value={description[activeLangTab]}
                onChange={(e) => setDescription({ ...description, [activeLangTab]: e.target.value })}
                className="px-4 py-3 bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition resize-none"
              />
            </div>

            {/* Amenities Input */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                {activeLangTab === "en" ? t("form.amenities_en") : t(`form.amenities_${activeLangTab}`)}
              </label>
              <input 
                type="text"
                placeholder={activeLangTab === "en" ? "e.g. WiFi, Pool, Air Conditioning" : "Translation (Optional)"}
                value={amenities[activeLangTab]}
                onChange={(e) => setAmenities({ ...amenities, [activeLangTab]: e.target.value })}
                className="px-4 py-3 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition"
              />
            </div>

            {/* House Rules Input */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                {activeLangTab === "en" ? t("form.rules_en") : t(`form.rules_${activeLangTab}`)}
              </label>
              <input 
                type="text"
                placeholder={activeLangTab === "en" ? "e.g. No smoking inside, No pets allowed" : "Translation (Optional)"}
                value={houseRules[activeLangTab]}
                onChange={(e) => setHouseRules({ ...houseRules, [activeLangTab]: e.target.value })}
                className="px-4 py-3 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition"
              />
            </div>

            {/* Location Description Input */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                {activeLangTab === "en" ? t("form.loc_desc_en") : t(`form.loc_desc_${activeLangTab}`)}
              </label>
              <textarea 
                rows="2"
                placeholder={activeLangTab === "en" ? "e.g. Conveniently located near transit and local cafes." : "Translation (Optional)"}
                value={locationDescription[activeLangTab]}
                onChange={(e) => setLocationDescription({ ...locationDescription, [activeLangTab]: e.target.value })}
                className="px-4 py-3 bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition resize-none"
              />
            </div>
          </div>

          {/* Pricing, cleaning fees, service fees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center">
                <DollarSign className="h-3.5 w-3.5 mr-0.5 shrink-0" /> {t("form.base_price")}
              </label>
              <input 
                type="number" 
                required
                min="0"
                placeholder="Per night price"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">{t("form.cleaning_fee")}</label>
              <input 
                type="number" 
                min="0"
                placeholder="Cleaning cost"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">{t("form.service_fee")}</label>
              <input 
                type="number" 
                min="0"
                placeholder="Platform fee"
                value={serviceFee}
                onChange={(e) => setServiceFee(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition"
              />
            </div>
          </div>

          {/* Locations and category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-0.5 shrink-0" /> {t("form.city")}
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. North Goa"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center">
                <Compass className="h-3.5 w-3.5 mr-0.5 shrink-0" /> {t("form.country")}
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-slate-200 focus:border-brand transition"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center">
                <Globe className="h-3.5 w-3.5 mr-0.5 shrink-0" /> {t("form.category")}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none text-slate-850 dark:text-slate-200 focus:border-brand transition cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-250 font-bold">{t(`categories.${cat}`)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Uploader */}
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] sm:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">{t("form.image")}</label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30">
              {imagePreview ? (
                <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-100 dark:bg-slate-955 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/40">
                  <Upload className="h-6 w-6 text-slate-400" />
                </div>
              )}
              
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">{t("form.image_upload_title")}</p>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-0.5">{t("form.image_upload_sub")}</p>
                <label className="inline-block mt-3 px-4 py-2 bg-slate-150 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-750 dark:text-slate-200 rounded-xl cursor-pointer transition">
                  {t("form.choose_file")}
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
              {t("form.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-brand to-brand-dark text-white rounded-2xl text-xs font-black uppercase tracking-wider transition active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[120px] shadow-lg shadow-brand/10 cursor-pointer"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                listing ? t("form.submit_edit") : t("form.submit_create")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
