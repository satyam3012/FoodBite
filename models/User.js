var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
  image:{
    type: String,
    required: false
  },
  name:{
    type: String,
    required: true
  },
  username:{
    type:String,
    required: true
  },
  email:{
    type:String,
    required:true
  },
  contact:{
    type: String,
    required:true
  },
  address:{
    type:String,
    required:true
  },
  password:{
    type: String,
    required: true
  }
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);
