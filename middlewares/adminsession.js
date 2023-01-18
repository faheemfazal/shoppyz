

const session=(req,res,next)=>{
    if(req.session.adminLoginIn){
        next()
    }else{
        res.redirect('/admin')
    }
}

module.exports=session;   
 

