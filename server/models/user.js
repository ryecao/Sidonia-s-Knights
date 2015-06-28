var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema({
    email: String,
    score: double,
    passwordHash: String,
    passwordSalt: String
});

module.exports = mongoose.model('User', UserSchema);