 const mongoose =require('mongoose')
const { String, Number, Array } = require('mongoose/lib/schema/index');
const { array } = require('../middlewares/multerimg');

 const productScheama= new mongoose.Schema({
     ProductName:{
        type:String,
        required:true

     },
     Category:{
        type :String,
        required:true
    
     },
     Quantity:{
        type :Number,
        required:true
        
     },
     rating:{
      type:Number,
      default:0   
  },
  review:{
   type:Number,
   default:0
  },
     Colour:{
        type:String,
        required:true
    
     },
     Price:{
        type:Number,
        required:true
        
     },
     Offer:{
        type:Number,
        required:true
     },
     Discription:{ 
        type:String,
        required:true
    
     },
     imageUrl:{
        type:Array,
        required:true    
     },

     optionsRadios:{
        type:String,
        required:true
   
     },
     discountpersentage:{
      type:Number,
      default: 0
    
    }

 },
 {
   timestamps:true
}
 )
const Product = mongoose.model('product', productScheama)
module.exports = Product;


 