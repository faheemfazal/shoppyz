const mongoose= require('mongoose')
const { String, Number } = require('mongoose/lib/schema/index')
const moment =require('moment')

const riviewScheema= new mongoose.Schema({
    User:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user' 
    },
    products:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "product"
     },
    riview:{
        type:String,
        required:true
    },
    title: {
        type: String,
    },
    rating:{
        type:Number
    },
    Date:{
        type:String,
        default:moment(Date.now()).format('DD/MM/YYYY')
    }
}
)

const review= mongoose.model('Rewiew',riviewScheema)
module.exports=review;