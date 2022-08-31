mongoose = require('mongoose')

const schema = new mongoose.Schema({
    author: {
        type: String,
        required: true,
    },
    pictb64: {
        type: String,
        require: true,
    },
    imgtype: {
        type: String,
        require: true,
    },
    uploadedAt: {
        type: Number,
        required: true,
    },
})

const Picture = mongoose.model('pictures', schema)
module.exports = Picture
