const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email:{
        type:String,
        required:true
    }
});

// will add on user name and password to schema above
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);