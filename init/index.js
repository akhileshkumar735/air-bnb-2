const mongoose = require("mongoose");
const initdata = require("./data.js");
const listing = require('../models/listing.js');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wonderlust';

main().then((res) =>{
    console.log("connection is successful");
})
.catch((err) =>{
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initdb = async () =>{
    await listing.deleteMany({});
   initdata.data =  initdata.data.map((obj) => ({...obj, owner:'67f98858ac57ecb2dce046a1'}))
    await listing.insertMany(initdata.data);
    console.log("data was initialize");
}

initdb();