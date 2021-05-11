const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const orderSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },

    cart : {
        type : Object,
        required : true
    },

    name : {
        type : String,
        required : true
    },

    address : {
        type : String,
        required : true
    }
});
module.exports = mongoose.model('order', orderSchema);
