var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var ContactSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  number:{
    type: String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  help:{
    type:String,
    required:true
  }
});

ContactSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("contact", ContactSchema);
