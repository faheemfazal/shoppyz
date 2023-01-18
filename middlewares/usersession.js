const userDb =require('../models/usermodel')

const userSession=(req,res,next)=>{
    if(req.session.loggedIn){
next()
    }else{
        res.redirect('/login')
    }
}

const postCheckout=async (req,res)=>{
    console.log(req.body);
}



const BlockUserChecke=async(req,res,next)=>{
   const userId=req.session.user  
   const user= await userDb.findOne({_id:userId})
   if(user.block == true){
     next()
   }else{
     res.render('user/blocked',{user:req.session.user})
     req.session.destroy()
   }
}



 


module.exports={
    userSession,
    BlockUserChecke,
    postCheckout
}