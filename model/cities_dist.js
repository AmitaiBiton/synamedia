const mongoose = require('mongoose')
const validator = require('validator')

/*Building a model that will require our collection to be in the way we are interested in putting items into the database */
var distSchema = new mongoose.Schema({
    /* */
    source: {
        type: String,
        required: true
        
    },
    destination: {
        type: String,
        required: true
        
    },

    hits:{
        type:Number,
        required:true
    },

    distance: {
        type: String,
        default: 0,
        required:true,
        /* distance can not be under zero unvalid */
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    }
}, { timestamps: true }
);

const dist = mongoose.model('dist', distSchema);

module.exports = dist