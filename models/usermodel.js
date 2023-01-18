const mongoose=require('mongoose')
const { String } = require('mongoose/lib/schema/index')
const userSchema=new mongoose.Schema({
    FirstName:{
        type:String,
        required:true
    },
    SecondName:{
        type:String,
        required:true
    }, 
    Email:{
        type:String,
        required:true   
    },
    Password:{
        type:String,
        required:true
    },
    Confirm:{
        type:String,
        required:true
    }, 
    Number:{
        type:Number,
        required:true
    },
    block:{
        type:Boolean, 
        default:true
    },
    wallet: {
        type: Number, 
        default:0,
      },
});
const user =mongoose.model('user',userSchema);
module.exports=user;