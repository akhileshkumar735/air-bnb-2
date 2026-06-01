const axios = require("axios");

const testApi = async () => {
  try {
    console.log("Testing GET /api/listings...");
    const resListings = await axios.get("http://localhost:8000/api/listings?limit=1");
    console.log("GET /api/listings status:", resListings.status);
    const listingId = resListings.data.listings[0]._id;
    console.log("Found listing ID:", listingId);

    console.log(`Testing GET /api/listings/${listingId}/availability...`);
    const resAvailability = await axios.get(`http://localhost:8000/api/listings/${listingId}/availability`);
    console.log("GET /api/listings/.../availability status:", resAvailability.status);
    console.log("Booked dates:", resAvailability.data.bookedDates);
    
    process.exit(0);
  } catch (err) {
    console.error("API test failed:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
    process.exit(1);
  }
};

testApi();
