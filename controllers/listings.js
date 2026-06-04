const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const cacheManager = require("../utils/cache.js");
const { translateText } = require("../utils/translator.js");

const mapToken = process.env.MAP_TOKEN || "mock_token";
let geocodingClient = null;
try {
  geocodingClient = mbxGeocoding({ accessToken: mapToken });
} catch (err) {
  console.warn("Mapbox SDK Geocoding client initialization failed:", err.message);
}

// 1. Get All Listings (Search & Paginated)
module.exports.index = async (req, res) => {
  const { 
    q, location, country, category, 
    minPrice, maxPrice, minRating, 
    sortBy, page = 1, limit = 12 
  } = req.query;

  // Cache key based on query filters
  const cacheKey = `listings:${JSON.stringify(req.query)}`;
  
  try {
    // 1. Return cached results if available
    const cachedData = await cacheManager.getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // 2. Build Query
    const query = {};

    if (q) {
      query.$text = { $search: q };
    } else {
      if (location) query.location = new RegExp(location, "i");
      if (country) query.country = new RegExp(country, "i");
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // 3. Sorting Options
    let sortOptions = {};
    if (sortBy === "price_asc") sortOptions = { basePrice: 1 };
    else if (sortBy === "price_desc") sortOptions = { basePrice: -1 };
    else if (sortBy === "rating_desc") sortOptions = { averageRating: -1 };
    else sortOptions = { _id: -1 }; // default: newest

    // 4. Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const skipNum = (pageNum - 1) * limitNum;

    const [listings, totalCount] = await Promise.all([
      Listing.find(query)
        .select("title description image price basePrice location country category averageRating reviewCount owner")
        .sort(sortOptions)
        .skip(skipNum)
        .limit(limitNum)
        .lean(),
      Listing.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);
    const responsePayload = {
      listings,
      totalCount,
      totalPages,
      page: pageNum
    };

    // Cache the response payload for 5 minutes
    await cacheManager.setCache(cacheKey, responsePayload, 300);

    res.status(200).json(responsePayload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Get Single Listing Details
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `listing:${id}`;

  try {
    const cachedData = await cacheManager.getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const listingData = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
          select: "username avatar"
        }
      })
      .populate("owner", "username email avatar")
      .lean();

    if (!listingData) {
      return res.status(404).json({ message: "Listing you requested does not exist." });
    }

    await cacheManager.setCache(cacheKey, { listing: listingData }, 600); // cache details for 10 minutes

    res.status(200).json({ listing: listingData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Create Listing (with Geocoding fallback and Auto Translation)
module.exports.createListing = async (req, res, next) => {
  try {
    const listingData = req.body.listing || {};
    const title = listingData.title || { en: req.body.title || "" };
    const description = listingData.description || { en: req.body.description || "" };
    const amenities = listingData.amenities || { en: req.body.amenities || "" };
    const houseRules = listingData.houseRules || { en: req.body.houseRules || "" };
    const locationDescription = listingData.locationDescription || { en: req.body.locationDescription || "" };

    const basePrice = Number(req.body.basePrice || req.body.price || listingData.price || 0);
    const cleaningFee = Number(req.body.cleaningFee || listingData.cleaningFee || 0);
    const serviceFee = Number(req.body.serviceFee || listingData.serviceFee || 0);
    const location = req.body.location || listingData.location || "";
    const country = req.body.country || listingData.country || "";
    const category = req.body.category || listingData.category || "Beach";

    // Auto-translate empty fields from English source
    const targetLangs = ["hi", "fr", "es"];
    
    // Title translation
    for (let lang of targetLangs) {
      if (!title[lang] && title.en) {
        title[lang] = await translateText(title.en, lang);
      }
    }
    
    // Description translation
    for (let lang of targetLangs) {
      if (!description[lang] && description.en) {
        description[lang] = await translateText(description.en, lang);
      }
    }

    // Amenities translation
    for (let lang of targetLangs) {
      if (!amenities[lang] && amenities.en) {
        amenities[lang] = await translateText(amenities.en, lang);
      }
    }

    // House Rules translation
    for (let lang of targetLangs) {
      if (!houseRules[lang] && houseRules.en) {
        houseRules[lang] = await translateText(houseRules.en, lang);
      }
    }

    // Location Description translation
    for (let lang of targetLangs) {
      if (!locationDescription[lang] && locationDescription.en) {
        locationDescription[lang] = await translateText(locationDescription.en, lang);
      }
    }

    let coordinates = [77.2090, 28.6139]; // Default coordinates (Delhi)
    if (geocodingClient && location) {
      try {
        const geoResponse = await geocodingClient.forwardGeocode({
          query: `${location}, ${country}`,
          limit: 1
        }).send();
        
        if (geoResponse?.body?.features?.length > 0) {
          coordinates = geoResponse.body.features[0].geometry.coordinates;
        }
      } catch (e) {
        console.warn("Geocoding service failed, using default coordinates:", e.message);
      }
    }

    let url = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800";
    let filename = "DefaultImage";
    
    if (req.file) {
      url = req.file.path;
      filename = req.file.filename;
    }

    const newListing = new Listing({
      title,
      description,
      amenities,
      houseRules,
      locationDescription,
      price: basePrice, // fallback EJS field
      basePrice,
      cleaningFee,
      serviceFee,
      location,
      country,
      category,
      image: { url, filename },
      owner: req.user.id,
      geometry: {
        type: "Point",
        coordinates
      }
    });

    const savedListing = await newListing.save();

    // Clear list caches since a new property is created
    await cacheManager.delPattern("listings:*");

    res.status(251).json({ message: "New listing created.", listing: savedListing });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 4. Update Listing
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  
  try {
    const listingData = req.body.listing || {};
    const title = listingData.title || (req.body.title ? { en: req.body.title } : undefined);
    const description = listingData.description || (req.body.description ? { en: req.body.description } : undefined);
    const amenities = listingData.amenities || (req.body.amenities ? { en: req.body.amenities } : undefined);
    const houseRules = listingData.houseRules || (req.body.houseRules ? { en: req.body.houseRules } : undefined);
    const locationDescription = listingData.locationDescription || (req.body.locationDescription ? { en: req.body.locationDescription } : undefined);

    const basePrice = req.body.basePrice !== undefined ? Number(req.body.basePrice) : (listingData.price !== undefined ? Number(listingData.price) : undefined);
    const cleaningFee = req.body.cleaningFee !== undefined ? Number(req.body.cleaningFee) : (listingData.cleaningFee !== undefined ? Number(listingData.cleaningFee) : undefined);
    const serviceFee = req.body.serviceFee !== undefined ? Number(req.body.serviceFee) : (listingData.serviceFee !== undefined ? Number(listingData.serviceFee) : undefined);
    const location = req.body.location || listingData.location;
    const country = req.body.country || listingData.country;
    const category = req.body.category || listingData.category;

    // Auto-translate empty language fields
    const targetLangs = ["hi", "fr", "es"];
    
    if (title) {
      for (let lang of targetLangs) {
        if (!title[lang] && title.en) {
          title[lang] = await translateText(title.en, lang);
        }
      }
    }
    
    if (description) {
      for (let lang of targetLangs) {
        if (!description[lang] && description.en) {
          description[lang] = await translateText(description.en, lang);
        }
      }
    }

    if (amenities) {
      for (let lang of targetLangs) {
        if (!amenities[lang] && amenities.en) {
          amenities[lang] = await translateText(amenities.en, lang);
        }
      }
    }

    if (houseRules) {
      for (let lang of targetLangs) {
        if (!houseRules[lang] && houseRules.en) {
          houseRules[lang] = await translateText(houseRules.en, lang);
        }
      }
    }

    if (locationDescription) {
      for (let lang of targetLangs) {
        if (!locationDescription[lang] && locationDescription.en) {
          locationDescription[lang] = await translateText(locationDescription.en, lang);
        }
      }
    }

    let updatedListing = await Listing.findById(id);
    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    // Apply updates
    if (title) updatedListing.title = title;
    if (description) updatedListing.description = description;
    if (amenities) updatedListing.amenities = amenities;
    if (houseRules) updatedListing.houseRules = houseRules;
    if (locationDescription) updatedListing.locationDescription = locationDescription;

    if (basePrice !== undefined) {
      updatedListing.price = basePrice;
      updatedListing.basePrice = basePrice;
    }
    if (cleaningFee !== undefined) updatedListing.cleaningFee = cleaningFee;
    if (serviceFee !== undefined) updatedListing.serviceFee = serviceFee;
    if (location) updatedListing.location = location;
    if (country) updatedListing.country = country;
    if (category) updatedListing.category = category;

    if (req.file) {
      updatedListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    // Geocoding update if location changes
    if (location && location !== updatedListing.location && geocodingClient) {
      try {
        const geoResponse = await geocodingClient.forwardGeocode({
          query: `${location}, ${country}`,
          limit: 1
        }).send();
        if (geoResponse?.body?.features?.length > 0) {
          updatedListing.geometry = geoResponse.body.features[0].geometry;
        }
      } catch (err) {
        console.warn("Geocoding during update failed:", err.message);
      }
    }

    const savedListing = await updatedListing.save();

    // Clear caches for this listing and lists
    await cacheManager.delCache(`listing:${id}`);
    await cacheManager.delPattern("listings:*");

    res.status(200).json({ message: "Listing updated successfully.", listing: savedListing });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 5. Delete Listing
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    // Clear caches
    await cacheManager.delCache(`listing:${id}`);
    await cacheManager.delPattern("listings:*");

    res.status(200).json({ message: "Listing deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};