const mongoose = require('mongoose')

const userSchemaTask = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{
    timestamps:true
})
const Task = mongoose.model('Task', userSchemaTask)

module.exports = Task