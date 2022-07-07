//data structure
var mongoose = require('mongoose');

mongoose.model("User", new mongoose.Schema({
    email: String,
    passwordHash: String //secure version of password
}))