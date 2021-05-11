const mongoose = require('mongoose'),
      passportLocalMongoose = require('passport-local-mongoose');

//Schema of restaurant
const restaurantSchema = new mongoose.Schema({
    id : {
        type : String,
        required : true
    },

    name : {
        type : String,
        required : true
    },

    category : {
        type : String,
        required : true
    },

    image : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },

     description : {
      type : String,
      required : true
    },
    contact : {
        type : String,
        required : true
    },

    address : {
        type : String,
        required : true
    },

    fooditems : [
      {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'FoodItem'
      }
    ]
});
restaurantSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Restaurant', restaurantSchema);
