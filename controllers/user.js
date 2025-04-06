const User = require("../models/user");
const Listing = require("../models/listing");

module.exports.renderSignupForm = async (req, res) => {
    res.render("users/signup");
}

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        let registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        })
    } catch (err) {
        req.flash("error", "Given username is already exist!")
        res.redirect("/signup");
    }

}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
}
module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged out");
        res.redirect("/listings");
    })
}

module.exports.profile = async(req, res) => {
    let userId = req.user._id;
    let bookedListings = await Listing.find({"reservations.user" : userId});
    
    res.render("users/profile.ejs", {bookedListings});
}