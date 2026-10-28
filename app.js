if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressErrors = require("./utils/ExpressErrors.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;    
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const {isLoggedIn} = require("./middleware.js");



//routes
const listingRoute = require("./routes/listing.js");
const reviewRoute = require("./routes/reviews.js");
const userRoute = require("./routes/user.js");


const path = require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error",(err)=>{
    console.log("ERROR ON MONGO SESSION STORE",err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized:true,
    cookie: {
        expires: Date.now() + 7*60*60*60*1000,
        maxAge : 7*60*60*60*1000,
        httpOnly : true
    }
}


main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(dbUrl);
}


app.use(session(sessionOptions));
app.use(flash())


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    res.locals.mapToken = process.env.MAP_TOKEN;
    next();
});


// app.get("/demouser", async(req,res)=>{
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username: "sigma-student"
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })


app.get("/",(req,res)=>{
    res.redirect("/listings");
})

// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "by the beach",
//         price: 122000,
//         location:" Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("successful");
// });

//listing routes
app.use("/listings",listingRoute);
//reviews routes
app.use("/listings/:id/reviews",reviewRoute);
// user route
app.use("/",userRoute);


//error
app.all("/{*splat}",(req,res,next)=>{
    next(new ExpressErrors(404,"Page not found"));
}); 


 //middleware
// app.use((err,req,res,next)=>{
//     res.send("Something went wrong!");
// });
// ExpressErrors custom class - 
app.use((err, req, res, next) => {
    let { statusCode=400, message="Something went wrong" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{err});
});

app.listen(8080,()=>{
    console.log("server listening at port 8080");
});