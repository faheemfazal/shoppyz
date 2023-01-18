const mongoose = require('mongoose')
const { String, Array } = require('mongoose/lib/schema/index')

const categarySchema = new mongoose.Schema({
    categary:{
        type:String,
       

    },
    imageUrl:{
        type:Array,
       
    },
    offer:{
        type:Number,
        default: 0
      }
},{
    timestamps:true
}
);
const categary = mongoose.model('categary',categarySchema)
module.exports=categary