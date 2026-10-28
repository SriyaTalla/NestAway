const { model } = require("mongoose");
const User = require("../models/user.js");

module.exports.signupForm = (req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.signup = async(req,res,next)=>{
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser , (err)=>{
            if(err){
                next(err);
            }
            req.flash("success","Welcome to NestAway!");
            res.redirect("/listings");
        })
    }catch(e){ 
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}

module.exports.loginForm = (req,res)=>{
    res.render("users/login.ejs");
}

module.exports.login = async(req,res)=>{
    req.flash("success","Welcome back to NestAway!");
    let redirectedUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectedUrl);
}

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","You are logged out!");
        res.redirect("/listings");
    })
}