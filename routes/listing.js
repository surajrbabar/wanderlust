const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {validateListing} = require("../middleware.js");
const {isLoggedIn, isOwner, validateDates, isAlreadyOccupied, deleteReservationAfterCheckOut} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


//Index route
router.get("/", wrapAsync(listingController.index));

//Render Search or Home
router.get("/home", listingController.renderHomePage);

//Search Listing route
router.get("/search", wrapAsync(listingController.searchListing));

//New route
router.get("/new",isLoggedIn, listingController.renderNewListingForm);

//Show route
router.get("/:id",deleteReservationAfterCheckOut, wrapAsync(listingController.showListing));

//create route
router.post("/",isLoggedIn,upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));

//Edit route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm))

//Update route
router.put("/:id",isLoggedIn,isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))

//Delete route
router.delete("/:id",isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));


//Render reservation page
router.get("/:id/reserve",isLoggedIn, wrapAsync(listingController.renderReservationPage));

//Create reservation
router.post("/:id/reserve",isLoggedIn, validateDates, isAlreadyOccupied, wrapAsync(listingController.createReservation))

module.exports = router;
