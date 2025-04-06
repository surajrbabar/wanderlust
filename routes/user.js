const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware");
const userController = require("../controllers/user");
const Listing = require("../models/listing");

router.get("/user/author",isLoggedIn, async(req, res) => {
    let listings = await Listing.find({owner : req.user._id}).populate({path : "reservations", 
        populate : {path : "user"}});
    
    if(listings.length === 0){
        req.flash("You hasn't created a listing yet !");
        return res.redirect("/listings");
    }
    console.log(listings);
    // res.send(listings);
    res.render("listings/author.ejs", {listings});
})

router.get("/signup", userController.renderSignupForm);

router.post("/signup", wrapAsync(userController.signup));

router.get("/login", userController.renderLoginForm);

router.post("/login", saveRedirectUrl,
    passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }),
    userController.login);

router.get("/logout", userController.logout);

router.get("/profile",isLoggedIn, userController.profile);



module.exports = router;