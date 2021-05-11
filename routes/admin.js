var express = require("express");
var router = express.Router();
var passport = require("passport");
var Admin = require("../models/Admin");
var Restaurant = require("../models/Restaurant");
var Food = require("../models/FoodItem");


//register route
router.get("/registerAdmin",forwardAuthenticated,function(req, res){
  res.render("registerAdmin");
});

//post register
router.post('/registerAdmin', (req, res) =>{
  const {adminImage,adminName, adminUsername, adminEmail, adminContact, adminAddress, adminPassword} = req.body;
  var errors = [];
  if(!adminName || !adminUsername || !adminEmail || !adminContact || !adminAddress || !adminPassword){
    errors.push({msg : 'Please enter all fields'});
  }

  if(errors.length>0){
    res.render('registerAdmin', {errors,adminImage, adminName, adminUsername, adminEmail, adminContact, adminAddress, adminPassword});
  }

  else {
    Admin.findOne({adminEmail : adminEmail, adminUsername : adminUsername}, (err, admin) =>{
      if(admin){
        errors.push({msg : 'User already exists'});
        res.render('registerAdmin', {errors, adminImage,adminName, adminUsername, adminEmail, adminContact, adminAddress, adminPassword});
      }
      else {
        var admin = {adminImage: adminImage,adminName : adminName, adminUsername : adminUsername, adminEmail : adminEmail, adminContact : adminContact, adminAddress : adminAddress, adminPassword : adminPassword};
        Admin.create(admin, (err, data) =>{
          if(err){
            console.log(err);
          }
          else {
            console.log('admin created');
            res.redirect('/loginAdmin');
          }
        });
      }
    });
  }
});

//show login form
router.get("/loginAdmin",forwardAuthenticated,function(req, res){
  res.render("loginAdmin");
});

//handling login route
router.post("/loginAdmin",passport.authenticate("local",
   {
     successRedirect: "/restaurants",
     failureRedirect: "/loginAdmin"
  }), function(req,res){
});

router.get('/restaurants',(req,res) =>{
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
        res.render('restaurants', {restaurants : allRestaurants, noMatch : noMatch});
      }
    });
  }
  else {
    Restaurant.find({}, (err, restaurants) =>{
      if(err){
        console.log(err);
      }
      else{
        res.render('restaurants', {restaurants : restaurants, noMatch : noMatch});
      }
    });
  }
  //console.log(currentUser);
});


//show Profile route for admin
router.get("/restaurants/:id/adminProfile",function(req,res){
   res.render("adminProfile");
});

//edit admin profile
router.get('/admin/editProfile', (req, res) =>{
  Admin.findById(req.user.id, (err, foundAdmin) =>{
    if(err){
      console.log(err);
    }
    else {
    console.log(foundAdmin);
    }
  });
});

//========================================================================

//add a new restaurant page
router.get('/restaurants/addRestaurant',ensureAuthenticated,(req, res) =>{
  res.render('addRestaurant');
});

//post a new restaurant page
router.post('/restaurants/addRestaurant', (req, res) =>{
   var newRestaurant = new Restaurant({
      id: req.body.id,
      name: req.body.name,
      category: req.body.category,
      image: req.body.image,
      description: req.body.description,
      email: req.body.email,
      contact: req.body.contact,
      address: req.body.address
   });
      Restaurant.create(newRestaurant, function(err, newRestaurant){
        if(err){
          console.log(err);
        }
        else {
          res.redirect('/home');
        }
      });
});

//particular restaurant route
router.get('/restaurants/:id',ensureAuthenticated, (req, res) =>{
  Restaurant.findById(req.params.id).populate('fooditems').exec(function(err, foundRestaurant){
    if(err){
      console.log(err);
    }
    else {
      console.log(foundRestaurant);
      res.render('middlePage', {restaurant:foundRestaurant});
    }
  });
});

//view restaurant route
router.get('/viewRestaurant', (req, res) =>{
  Restaurant.find({}, (err, allRestaurants) =>{
    if(err){
      console.log(err);
      res.redirect('/home');
    }
    else {
          res.render('viewRestaurant', {restaurants : allRestaurants});
    }
  });
});

//edit restaurant routes
router.get('/restaurants/:id/edit', (req, res) =>{
  Restaurant.findById(req.params.id, (err, foundRestaurant) =>{
    if(err){
      console.log(err);
    }
    else {
      res.render('editRestaurant', {restaurant : foundRestaurant});
    }
  });
});

//post update restaurant
router.put('/restaurants/:id', (req, res) =>{
  var restaurant = {id : req.body.id, name : req.body.name, category : req.body.category,description : req.body.description,email: req.body.email, contact : req.body.contact,address : req.body.address};
  Restaurant.findByIdAndUpdate(req.params.id, restaurant, (err, foundRestaurant) =>{
    if(err){
      console.log(err);
      res.redirect('/restaurants');
    }
    else {
      res.redirect('/home');
    }
  });
});

//handling delete restaurant
router.delete('/restaurants/:id', (req, res) =>{
  Restaurant.findByIdAndDelete(req.params.id, (err) =>{
    if(err){
      res.redirect('/restaurants');
    }
    else {
      res.redirect('/home');
    }
  });
});

//============================================================================

//get a form for add food items
router.get('/restaurants/:id/foods/addFood', (req, res) =>{
  Restaurant.findById(req.params.id, (err, foundRestaurant) =>{
    if(err){
      console.log(err);
    }
    else {
      res.render('addFood', {restaurant : foundRestaurant});
    }
  });
});

//post add food item form
router.post('/restaurants/:id/foods/addFood', (req, res) =>{
  Restaurant.findById(req.params.id, (err, foundRestaurant) =>{
    if(err){
      console.log(err);
      res.redirect('/restaurants/:id/addFood');
    }
    else {
      var food = {
          foodId : req.body.foodId,
          foodName : req.body.foodName,
          foodCategory : req.body.foodCategory,
          foodImage : req.body.foodImage,
          foodPrice : req.body.foodPrice,
          foodDescription : req.body.foodDescription,
          restaurantId : req.body.restaurantId
        };
       Food.create(food, (err, foodCreated) =>{
        if(err){
          console.log(food);
          console.log(err);
        }
        else {
          foundRestaurant.fooditems.push(foodCreated);
          foundRestaurant.save();
          res.redirect('/restaurants/' + foundRestaurant._id);
        }
      });
    }
  });
});

//get a form to view food items
router.get('/restaurants/:id/foods/viewFood', (req, res) =>{
  Food.find({}, (err, allFoods) =>{
    if(err){
      console.log(err);
    }
    else {
        res.render('viewFood', {foods : allFoods});
    }
  });
});

//handling food edit
router.get('/restaurants/:id/foods/:food_id/edit', (req, res) =>{
  Food.findById(req.params.food_id, (err, foundFood) =>{
    if(err){
      console.log(err);
    }
    else {
      res.render('editFood', {restaurant_id : req.params.id, food : foundFood});
    }
  });
});

//post food edit
router.put('/restaurants/:id/foods/:food_id', (req, res) =>{
  var food = {foodId : req.body.foodId, foodName : req.body.foodName, foodPrice:req.body.foodPrice,foodDescription : req.body.foodDescription, restaurantId:req.body.restaurantId};
  Food.findByIdAndUpdate(req.params.food_id, food, (err, updatedFood) =>{
    if(err){
      console.log(err);
      res.redirect('/restaurants/' + req.params.id + '/foods');
    }
    else {
      res.redirect('/restaurants/' + req.params.id + '/foods/' + 'viewFood');
    }
  });
});

//show middle page for particular restaurant : all cards
router.get("/restaurants/:id/foods",ensureAuthenticated,(req, res) =>{
  Restaurant.findById(req.params.id).populate('fooditems').exec(function(err, foundRestaurant){
    if(err){
      console.log(err);
      res.redirect('/home');
    }
    else {
      res.render('middlePage', {restaurant : foundRestaurant});
    }
  });
});

//delete fooditems
router.delete('/restaurants/:id/foods/:food_id', (req, res) =>{
  Food.findByIdAndDelete(req.params.food_id, (err) =>{
    if(err){
      console.log(err);
      res.redirect('/restaurants/' + req.params.id + '/foods');
    }
    else {
      res.redirect('/restaurants/' + req.params.id + '/foods');
    }
  });
});


function  ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
      return next();
  }
  res.redirect("/restaurants");
};

function forwardAuthenticated(req, res, next){
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect("/restaurants");
};

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
