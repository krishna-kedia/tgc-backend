const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String, 
        required: true
    },
    department: {
        type: String, 
    },
    designation: {
        type: String, 
        required: true
    },
    dept: {
        type: Boolean,
        default: false
    }
})

mongoose.model('User', userSchema)