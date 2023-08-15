function pagenation(model){
    return async (req,res,next)=>{
        console.log(req.query,'..........');
        const page=parseInt(req.query.page || 1);
        const limit=parseInt(req.query.limit || 6)
        console.log(page+" "+limit);
        const startIndex=(page-1)*limit;
        const endInndex=page * limit;
        const results={}
        results.current={page,limit}
        // if(Object.keys(req.query).length === 0){
        //     console.log('oooooooooooo');
        // }
        if(endInndex < await model.find().count()){
            results.next={
                page:page+1,
                limit:limit
            }
        }
        if(startIndex>0){
            results.previous={
                 page:page-1,
                 limit:limit
            }
        }
       try{
          results.results= await model.find().limit(limit).skip(startIndex).exec()
          res.pagenation=results

          next()
       }catch(e){
         res.status(500).json({message:e.message })
       }
    }

}
module.exports={
    pagenation
} 