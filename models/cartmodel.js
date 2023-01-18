
const mongoose=require('mongoose')
// const Product = require('./productModel')
// const user = require('./userModel')

const cartScheema= new mongoose.Schema({
    Owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"

    },
    items:[{
        ProductDetails:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
         },
        quantity:{
            type:Number,
            default:1
        },
        total:{
            type:Number,
            default:1
        },
        date:{
            type:Number,
            default:Date.now

        } 


    }],
    totalCart:{
        type:Number,
        default:0
    }

 

})

const cart= mongoose.model("cart",cartScheema);
module.exports=cart