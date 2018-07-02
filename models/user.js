const mongoose = require('mongoose')

const User = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_on: { type: Date, default: Date.now },
    deleted_on: { type: Date },
    modified_on: { type: Date },
    first_name: { type: String },
    last_name: { type: String },
    birthday: { type: String },
    city: { type: String },
    country: { type: String },
    occupation: { type: String }
})

module.exports = mongoose.model('User', User)
