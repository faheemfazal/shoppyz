

const mosgoose= require('mongoose')
const dotenv =require('dotenv')
console.log("..............")

dotenv.config({path:'./.env'})
DB=process.env.DATASBASE_LOCAL
console.log(DB);
const mongoosedb=mosgoose.connect(DB,{
    
    useNewUrlParser: true, 

useUnifiedTopology: true 

})
module.exports=mongoosedb
