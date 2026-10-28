const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate:{path: "author"}}).populate("owner");    
    if(!listing){
        req.flash("error","Listing doesnot exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing = async (req, res, next) => {
    try {
        let response = await geoCodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send()

        if (!req.file) {
            req.flash("error", "Please upload a listing image!");
            return res.redirect("/listings/new");
        }

        const listing = new Listing(req.body.listing);

        listing.owner = req.user._id;

        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        listing.geometry = {
            name: req.body.listing.location,
            location: {
                type: "Point",
                coordinates: response.body.features[0].geometry.coordinates
            }   
        };
        let saved = await listing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");

    } catch (err) {
        next(err);
    }
};

module.exports.editListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing doesnot exist!");
        return res.redirect("/listings");
    }
    let ogImageUrl = listing.image.url;
    ogImageUrl = ogImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,ogImageUrl});
}

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file != "undefined"){
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };  
        await listing.save();
    }
    req.flash("success","Listing Updated!"),
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted"),
    res.redirect("/listings");
}