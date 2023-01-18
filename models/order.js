const mongoose =require('mongoose')
const { String, Number, Boolean } = require('mongoose/lib/schema/index')

const orderSchema= new mongoose.Schema({
    date:{
        type:String,
        required:true

    },
    time:{
        type:String,
        // required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    products:[{
        ProductDetails:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"product"
        },
        quantity:{
            type:Number,
            default:1
        },
        total:{
            type:Number,
            default:0
        }

    }],
    totalAll: {
        type: Number,
        required: true,
      },
    address:{
        Fullname:String,
        number:Number,
        State:String,
        city:String,
        houseaddress:String,
        roadaddress:String,
        pinCode:Number

    },
    PaymentMethod:{
        type:String,
        required:true
    },
    paymentStatuse:{
        type:String,
        required:true
    },
    OrderStatuse:{
        type:String,
        required:true
    },
    track:{
        type:String

    },
    returnReason:{
        type:String

    },
    delete:{
       type:Boolean,
       default:true
    },
    useWallet:{
        type:Number
    },
    coupenDiscount:{
        type:Number

    }

},{
    timestamps:true
}
)

const Order= mongoose.model('Order',orderSchema);
module.exports=Order