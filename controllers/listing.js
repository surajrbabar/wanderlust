const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const {listingSchema,reviewSchema} = require("../schema.js");

module.exports.index = async(req, res) => {
    const allListings = await Listing.find();
    res.render("listings/index.ejs", {allListings});
}

module.exports.renderHomePage = (req, res) => {
    res.render("listings/home.ejs"); // Pass the class only for this page
}

module.exports.renderNewListingForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.searchListing = async (req, res) => {
    let {location} = req.query;
    if(!location){
        req.flash("error", "Enter any location");
        return res.redirect("/listings/home");
    }
    let allListings = await Listing.find({location : { $regex: location, $options: "i" }});

    if(allListings.length === 0){
        req.flash("error", "Does Not found any listings on this location");
        return res.redirect("/listings/home");
    }

    if(allListings.length === 1){
        let listing = allListings[0];
        return res.render("listings/show.ejs", {listing});
    }

    res.render("listings/index.ejs", {allListings});
}

module.exports.showListing = async(req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path : 'reviews', populate : {
        path : "author"
    }}).populate('owner');
    console.log(listing);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
}

module.exports.createListing = async(req, res) => {
    let responce = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      }).send();

    let result = listingSchema.validate(req.body);
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(result);
    if(result.err){
        throw new ExpressError(400, result.err);
    }
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = responce.body.features[0].geometry;
    console.log(newListing);
    await newListing.save();
    req.flash("success", "New listing is created");
    res.redirect("/listings");
}

module.exports.renderEditForm = async(req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }

    res.render("listings/edit.ejs", {listing});
}

module.exports.updateListing = async(req, res) => {
    let {id} = req.params;

    let responce = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      }).send();

    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    listing.geometry = responce.body.features[0].geometry;
    await listing.save();
    
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename}
        await listing.save();
    }
    
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async(req, res) => {
    let {id} = req.params;

    let deletedListings = await Listing.findByIdAndDelete(id);
    console.log(deletedListings);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}

module.exports.renderReservationPage = async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
     res.render("listings/reserve.ejs", {listing});
}

module.exports.createReservation = async(req, res) => {
    let {id} = req.params;
    let {checkIn, checkOut, totalCost} = req.body;
    
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "The listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    totalCost = Number(totalCost.replace(/,/g, ""));

    listing.reservations.push(
        {user : req.user._id, 
            checkIn : checkIn, 
            checkOut : checkOut, 
            totalCost : totalCost});

    await listing.save();

    req.flash("success", "Reservation Completed!");
    res.redirect(`/listings/${id}`);
}