
const mongoose=require('./config/connection')
const app=require('./app');

mongoose.then(()=>{
    console.log("db connected");
}).catch((err)=>{
    console.log(err)
})



const PORT=process.env.PORT ||3000
app.listen(PORT,(error)=>{
    
    if(error){
        console.log("error started "+error)
    }else{
        console.log("server started "+PORT)
    }
   
}) 

