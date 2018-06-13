const mongoose = require('mongoose')

const User = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_on: { type: String },
    modified_on: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    birthday: { type: String },
    occupation: { type: String }
})

module.exports = mongoose.model('User', User)
