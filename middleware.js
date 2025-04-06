const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const { checkout } = require("./routes/listing.js");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req, res, next) => {
    let {id} = req.params;

    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "Sorry, But your not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }

    next();
}

module.exports.validateListing = (req, res, next) => {
    let {err} = listingSchema.validate(req.body);
    if(err){
        // throw new ExpressError(400, err);
        let errMsg = err.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else{
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    let {err} = reviewSchema.validate(req.body);
    if(err){
        // throw new ExpressError(400, err);
        let errMsg = err.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else{
        next();
    }
}

module.exports.isReviewAuthor = async(req, res, next) => {
    let {id, reviewId} = req.params;

    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "Sorry, But your not the owner of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
}

module.exports.validateDates = async(req, res, next) => {
    let {id} = req.params;
    let checkIn = new Date(req.body.checkIn);
    let checkOut = new Date(req.body.checkOut);

    let currDate = new Date();
    currDate.setHours(0, 0, 0, 0);

    if(checkIn > checkOut || checkIn < currDate){
        req.flash("error", "Please enter valid date's");
        return res.redirect(`/listings/${id}/reserve`);
    }

    next();
}

module.exports.isAlreadyOccupied = async(req, res, next) => {
    let {id} = req.params;

    let checkIn = new Date(req.body.checkIn);
    let checkOut = new Date(req.body.checkOut);

    let listing = await Listing.findById(id);

    for(reservation of listing.reservations){
        if(checkIn > reservation.checkIn && checkIn < reservation.checkOut){
            req.flash("error", "Sorry, But the period your are looking for is already reserved");
            return res.redirect(`/listings/${id}/reserve`);
        }
        else if(checkOut > reservation.checkIn && checkOut < reservation.checkOut){
            req.flash("error", "Sorry, But the period your are looking for is already reserved");
            return res.redirect(`/listings/${id}/reserve`);
        }
        else if(checkIn < reservation.checkIn && checkOut > reservation.checkOut){
            req.flash("error", "Sorry, But the period your are looking for is already reserved");
            return res.redirect(`/listings/${id}/reserve`);
        }
        else if(checkIn > reservation.checkIn && checkOut < reservation.checkOut){
            req.flash("error", "Sorry, But the period your are looking for is already reserved");
            return res.redirect(`/listings/${id}/reserve`);
        }
    }

    next();
}

module.exports.deleteReservationAfterCheckOut = async (req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);

    let currDate = new Date();
    currDate.setHours(0, 0, 0, 0);

    for(reservation of listing.reservations){
        if(reservation.checkOut < currDate){
            await Listing.findByIdAndUpdate(id, {$pull : {reservations :{_id : reservation._id} }});
        }
    }

    next();
}