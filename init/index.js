const mongoose = require("mongoose");
const data = require("./data.js");
const Listing = require("../models/listing.js");

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/nestaway');
};


const initDB = async() => {
    await Listing.deleteMany({});
    data.data = data.data.map((obj)=>({...obj, owner: "6ab5321e378e16c9815ad399"}));
    await Listing.insertMany(data.data);
    console.log("data was initialised");
};
initDB();