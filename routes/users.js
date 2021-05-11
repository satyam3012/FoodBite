var express = require("express");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("../models/User");
var Contact = require("../models/Contact");
var Admin = require("../models/Admin");
var Restaurant = require("../models/Restaurant");
var Product = require("../models/Product");
var Cart = require("../models/Cart");
var FoodItem = require("../models/FoodItem");
var Order = require("../models/Order");

//home route
//router.get("/",function(req,res){
//  Restaurant.find({}, (err, restaurants) =>{
//    if(err){
//      console.log(err);
//    }
//    else{
//      res.redirect('/home');
//    }
//  });
//});

router.get("/",function(req,res){
  res.redirect("/home");
});

// Dashboard
router.get('/home', (req, res) =>{
  var noMatch = null;
  if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Restaurant.find({name : regex}, (err, allRestaurants) =>{
      if(err){
        console.log(err);
      }
      else {
        if(allRestaurants.length<1){
          noMatch = 'No restaurants found with this query..please try again!';
        }
        res.render('home', {restaurants : allRestaurants, noMatch : noMatch});
      }
    });
  }
  else {
    Restaurant.find({}, (err, restaurants) =>{
      if(err){
        console.log(err);
      }
      else{
        console.log(req.user);
        res.render('home', {restaurants : restaurants, noMatch : noMatch});
      }
    });
  }
  //console.log(currentUser);
});

//about route
router.get("/about",function(req,res){
  res.render("about");
});

//contact route
router.get("/contact",function(req,res){
  res.render("contact");
});

//contact post route
router.post("/contact",function(req,res){
   var contact = new Contact({
     name: req.body.name,
     number: req.body.number,
     email: req.body.email,
     help: req.body.help
   }).save(function(err,contact){
     if(err){
       console.log(err);
       return res.render("contact");
     }else{
       res.redirect("/home");
     }
   });
});


//register route
router.get("/registerUser",notLoggedIn,function(req, res){
  res.render("registerUser");
});
//handling user singup
router.post("/register",function(req,res){
 var newUser = new User({
       name: req.body.name,
       image: req.body.image,
       username: req.body.username,
       email: req.body.email,
       contact: req.body.contact,
       address: req.body.address,
       password: req.body.password
 });
  User.register(newUser ,req.body.password,function(err,user){
    if(err){
      console.log(err);
     return res.render("registerUser");
    }
    passport.authenticate("local")(req, res, function(){
      res.redirect("/");
    });
  });
});

//show login form
router.get("/loginUser",notLoggedIn,function(req, res){
  res.render("loginUser");
});

router.post("/loginUser",passport.authenticate("local",
   {
     failureRedirect: "/loginUser"
  }), function(req,res, next){
    if(req.session.oldUrl){
      res.redirect(req.session.oldUrl);
      req.session.oldUrl = null;
    }
    else{
      res.redirect('/');
    }
});

//logout route
router.get("/logout",function(req, res){
   req.logout();
   res.redirect("/");
});

//User profile route
router.get("/user/:id/userProfile",function(req,res){
  User.find({}, (err, user) =>{
    if(err){
      console.log(err);
    }
    else {
        res.render('userProfile', {user : user});
    }
  });
});


//==============================================================================

//restaurant details
router.get('/home/:id', (req, res) =>{
  Restaurant.findById(req.params.id).populate(' fooditems').exec(function( err, foundRestaurant ){
    if(err){
      console.log(err);
      res.redirect('/');
    }
    else if(!req.session.cart){
      res.render('show', {restaurant : foundRestaurant,products : null});
    }
    else {
      var cart = new Cart(req.session.cart);
      res.render('show',{restaurant : foundRestaurant,products: cart.generateArray(), totalPrice: cart.totalPrice});
    }
  });
});

//add to cart route
router.get('/home/:id/cart/:cart_id', (req, res) =>{
  var restaurantId = req.params.id;
  var productId = req.params.cart_id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  FoodItem.findById(productId, function(err, product) {
    if(err){
      res.redirect('/');
    }
    else{
      console.log(cart);
      cart.add(product, product.id);
      req.session.cart = cart;
      console.log(req.session.cart);
      res.redirect('/home/' + restaurantId);
    }
  });
});

//my cart page route
router.get('/shoppingCart', (req, res) =>{
  if(!req.session.cart){
    res.render('myCart', {products: null});
  }
  else{
    var cart = new Cart(req.session.cart);
    res.render('myCart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
  }
});

//remove one by one item from cart route
router.get('/home/:id/removeCart/:cart_id', (req, res) =>{
  var productId = req.params.cart_id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/home/' + req.params.id);
});

//remove all items from the cart
router.get('/home/:id/removeAll/:cart_id', (req, res) =>{
  var productId = req.params.cart_id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeAll(productId);
  req.session.cart = cart;
  res.redirect('/home/' + req.params.id);
});

//my order page route
router.get('/myOrders', (req, res) =>{
  Order.find({user : req.user}, (err, orders) =>{
    if(err){
      console.log(err);
    }
    else{
      var cart;
      orders.forEach(function(order) {
        cart = new Cart(order.cart);
        order.items = cart.generateArray();
      });
      res.render('myOrder', {orders : orders});
    }
  })
});

//checkout route
router.get('/checkout',isLoggedIn, (req, res) =>{
  if(!req.session.cart){
    res.redirect('/shoppingCart');
  }
  else{
    var cart = new Cart(req.session.cart);
    res.render('checkout', {total : cart.totalPrice, Cart : req.session.cart});
  }
});

//post checkout
router.post('/checkout', (req, res) =>{
  var order = {user : req.user, cart : Cart, name : req.body.holdername,address : req.body.address};
  Order.create(order, (err, neworder) =>{
    if(err){
      console.log(err);
      return res.redirect('/checkout');
    }
    res.render('orderplaced');
  });
});

//online payment route
router.get("/onlinePay",function(req,res){
  res.render("onlinePay");
});

//order placed route
router.get("/orderplaced",function(req,res){
  req.session.cart = null ;
  res.render("orderplaced");
});


function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect("/loginUser");
}

function notLoggedIn(req, res, next){
  if(!req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
