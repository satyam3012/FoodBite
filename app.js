var express = require("express"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    flash      = require("connect-flash"),
    passport = require("passport"),
    methodOverride = require("method-override"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    Admin = require("./models/Admin"),
    User = require("./models/User"),
    Restaurant = require("./models/Restaurant")

    var userRoutes = require("./routes/users"),
        adminRoutes = require("./routes/admin")

mongoose.connect("mongodb://localhost/Fooddy",{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}, (err) =>{
  if(err){
    console.log(err);
  }
  else {
    console.log('connected');
  }
});

//basic setup
var app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use("/Css",express.static("css"));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + "/public"));
app.use(require("express-session")({
  secret: "The best dog in the world",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  res.locals.session = req.session;
  next();
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(userRoutes);
app.use(adminRoutes);

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.listen(4000,function(){
  console.log("server started at app...");
});
