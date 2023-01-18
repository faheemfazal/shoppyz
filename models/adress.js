const mongoose =require('mongoose')

const AddressScheama = new mongoose.Schema({

    User:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user' 
    },
    Address:[{
       Fullname:{
        type:String,
        required:true
       },
       number:{
        type:Number,
        required:true
       },
       pinCode:{
        type:Number,
        required:true
       },
      State:{
        type:String,
        required:true
      },
      houseaddress:{
        type:String,
        required:true
      },
      roadaddress:{
        type:String,
        required:true
      },
      imageUrl:{
        type: Array,
        default:{
            filename:1
        }, 
        required:true
       
    }
     
    }]
}) 
 
const Address = mongoose.model('Address',AddressScheama)
module.exports=Address