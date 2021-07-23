const mongoose = require('mongoose')

const chapterSchema = new mongoose.Schema({
    chapterName:{
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
    workshops:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workshop"
    }],
    team:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    image:{
        type: String
    },
    carouselImages:[],
})

mongoose.model('Chapter', chapterSchema)