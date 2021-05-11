const mongoose = require('mongoose');
      passportLocalMongoose = require('passport-local-mongoose');

//Schema of foodItems
const foodItemSchema = new mongoose.Schema({
    foodId : {
      type : String,
      required : true
    },
    foodName : {
      type : String,
      required : true
    },
    foodImage : {
      type : String,
      required : true
    },
    foodPrice : {
      type : Number,
      required : true
    },
    foodDescription : {
      type : String,
      required : true
    },
    restaurantId : {
      type : String,
      required : true
    },
    foodCategory : {
      type : String,
      required : true
    }
  });
  foodItemSchema.plugin(passportLocalMongoose);
  module.exports = mongoose.model('FoodItem', foodItemSchema);
