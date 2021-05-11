const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const productSchema = new mongoose.Schema({
    image : {
        type : String,
        required : true
    },

    title : {
        type : String,
        required : true
    },

    description : {
        type : String,
        required : true
    },

    price : {
      type : Number,
      required : true
    }

});
productSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Product', productSchema);
