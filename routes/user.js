const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.js");
const {saveRedirectUrl} = require("../middleware.js");

const userController = require("../controllers/users.js");

const WrapAsync = (fn)=>{
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
};

router.route("/signup")
  .get ( userController.renderSignupForm)
  .post( WrapAsync(userController.signup));

router.route("/login")
  .get( userController.renderLoginForm)
  .post( 
      saveRedirectUrl,
      passport.authenticate("local", 
        {failureFlash: true, 
            failureRedirect: "/login"
    }), 
     userController.login   
    );


router.get("/logout",userController.logout);

module.exports = router;