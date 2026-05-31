require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/airbnb";

async function run() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB.");
    const listings = await Listing.find();
    console.log(`Total listings found: ${listings.length}`);
    
    let objectCount = 0;
    let stringCount = 0;
    let otherCount = 0;
    let nullUrlCount = 0;

    listings.forEach((l, index) => {
      const img = l.image;
      if (typeof img === "string") {
        stringCount++;
        if (index < 5) console.log(`Listing ${l.title} has string image:`, img);
      } else if (img && typeof img === "object") {
        objectCount++;
        if (!img.url) nullUrlCount++;
      } else {
        otherCount++;
      }
    });

    console.log(`Summary:\n- Object images: ${objectCount} (of which ${nullUrlCount} have null/empty url)\n- String images: ${stringCount}\n- Other/Null: ${otherCount}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
