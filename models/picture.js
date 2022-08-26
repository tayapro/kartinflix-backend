mongoose = require('mongoose')

const schema = new mongoose.Schema({
    pictb64: {
        type: String,
        require: true,
    },
    imgtype: {
        type: String,
        require: true,
    },
})

const Picture = mongoose.model('pictures', schema)
module.exports = Picture
