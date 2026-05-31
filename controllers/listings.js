const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const cacheManager = require("../utils/cache.js");

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

// 3. Create Listing (with Geocoding fallback)
module.exports.createListing = async (req, res, next) => {
  const { title, description, basePrice, location, country, category, cleaningFee, serviceFee } = req.body;
  
  try {
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
      price: Number(basePrice), // fallback EJS field
      basePrice: Number(basePrice),
      cleaningFee: Number(cleaningFee) || 0,
      serviceFee: Number(serviceFee) || 0,
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
  const { title, description, basePrice, location, country, category, cleaningFee, serviceFee } = req.body;
  
  try {
    const fieldsToUpdate = {
      title,
      description,
      price: Number(basePrice), // fallback EJS
      basePrice: Number(basePrice),
      cleaningFee: Number(cleaningFee),
      serviceFee: Number(serviceFee),
      location,
      country,
      category
    };

    let updatedListing = await Listing.findById(id);
    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    // Apply updates
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] !== undefined) {
        updatedListing[key] = fieldsToUpdate[key];
      }
    });

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