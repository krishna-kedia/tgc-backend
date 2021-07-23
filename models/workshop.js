const mongoose = require('mongoose')

const workshopSchema = new mongoose.Schema({
    workshopName:{
        type: String,
        required: true
    },
    flagshipStatValue1:{
        type: Number
    },
    flagshipStatValue2:{
        type: Number
    },
    flagshipStatValue3:{
        type: Number
    },
    description:{
        type: String,
        required: true
    },
    image:{
        type: String
    },
    carouselImages:[],
    testimonials:[{
        name: {
            type: String,
        },
        testimonial:{
            type: String
        }
    }],
    project:[{
        projectName:{
            type: String,
            required: true
        },
        personName:{
            type: String,
            required: true
        },
        courseName: {
            type: String,
            required: true
        },
        courseIcon:{
            type: String
        },
        projectImage:{
            type: String
        }
    }],
    LOR:{
        type: String
    },
    dates: {
        type: String, 
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    courseIcon: {
        type: String
    }
})

mongoose.model('Workshop', workshopSchema)