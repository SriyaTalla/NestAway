const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner,validateListing } = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage})


const listingController = require("../controllers/listing.js");

router.route("/")
    .get(wrapAsync(listingController.index)) //index route
    .post(
        isLoggedIn,
        upload.single("listing[image][url]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );

//new
router.get("/new",isLoggedIn, listingController.renderNewForm)

router.route("/:id")
.get(wrapAsync(listingController.showListing)) //show listing
.put(isLoggedIn,
    isOwner,
    upload.single("listing[image][url]"),
    validateListing, 
    wrapAsync(listingController.updateListing)
)                                                //update listing
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)) //delete listing

//write notes - edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editListing))


module.exports = router;