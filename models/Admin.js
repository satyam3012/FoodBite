var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var AdminSchema = new mongoose.Schema({
  adminImage:{
    type: String,
    required: false
  },
  adminName:{
    type: String,
    required: true
  },
  adminUsername:{
    type:String,
    required: true
  },
  adminEmail:{
    type:String,
    required:true
  },
  adminContact:{
    type: String,
    required:true
  },
  adminAddress:{
    type:String,
    required:true
  },
  adminPassword:{
    type: String,
    required: true
  }
});

AdminSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Admin", AdminSchema);
