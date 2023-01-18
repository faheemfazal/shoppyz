const multer=require('multer')
console.log("....multer add")
 
 const multerStorage= multer.diskStorage({
    destination:(req,file,cd)=>{
        cd(null,"public/images")
    },
    filename:(req,file,cb)=>{
        const ext =file.mimetype.split("/")[1];
        cb(null, `img-${file.fieldname}-${Date.now()}.${ext}`);
    },

 })
console.log("....multer add")
 const uplode= multer({
    storage:multerStorage
   
})

 module.exports=uplode
 