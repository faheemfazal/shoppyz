var express=require('express')
var router = express.Router()
const fileupload=require('../middlewares/multerimg')
const sessionadmin=require('../middlewares/adminsession')
var {
    getAdminLogPag,
    postAdminlogin,
    userDetails,
    getuplodpag,
    uploadProduct,
    viewProduct,
    getDashBoard,
    gethome,
    banuserdata,
    unbanUserata,
    getCategarylist,
    addCategary,
    postUplodCategary,
    categoryremove,
    categoryEdit,
    editedCategory,
    editUplodeProduct,
    postEditproduct,
    deleteproduct,
    adminlogout,
    getcoupenpage,
    postCoupen,
    getCoupen, 
    deletecoupen,
    activeCouppen,
    blockCoupen,
    getOrderData,
    viewBanner,
    AddBanner,
    postBanner,
    getBannerEdit,
    postEditedBanner,
    DeleteBanner,
    geterror,
    orderstatus,
    salesReport,
    getOrderDetails,
    monthReport,
    yearRreport,
    GetChartDetails,
    getPieChartDetails,
    aprpoveReturn     }=require('../controlls/admincontroller')
    

router.get('/admin',getAdminLogPag)
router.post('/adminsignup',postAdminlogin)
router.get('/userdetail',sessionadmin,userDetails)
router.get('/uploadproduct',sessionadmin,getuplodpag)
router.post('/uploadProduct',sessionadmin,fileupload.array("imageUrl",3),uploadProduct)
router.get('/viewProductAdmin',sessionadmin,viewProduct)
router.get('/dashBoard',sessionadmin,getDashBoard) 
router.get('/adminhome',sessionadmin,gethome) 
router.get('/banUser/:id',sessionadmin,banuserdata)
router.get('/UnBanUser/:id',sessionadmin,unbanUserata)
router.get('/categaryList',sessionadmin,getCategarylist)
router.get('/addCategary',sessionadmin,addCategary)
router.post('/uplodCategary',sessionadmin,fileupload.array("imageUrl",3),postUplodCategary)
router.get('/categoryRemove/:id',sessionadmin,categoryremove)
router.get('/editCategory/:id',sessionadmin,categoryEdit)
router.post('/editedValue/:id',sessionadmin,fileupload.array("imageUrl",3),editedCategory)
router.get('/editProduct/:id',sessionadmin,editUplodeProduct)
router.post('/PosteditProduct/:id',sessionadmin,fileupload.array("imageUrl",3),postEditproduct)
router.get('/deletProduct/:id',sessionadmin,deleteproduct)
router.get('/adminLogout',sessionadmin,adminlogout) 
router.get('/addCoupen',sessionadmin,getcoupenpage)
router.post('/addCoupen',sessionadmin,postCoupen)
router.get('/coupen',sessionadmin,getCoupen)
router.delete('/deletecoupen',sessionadmin,deletecoupen)
router.get('/ActiveCoupen',sessionadmin,activeCouppen)
router.get('/BlockCoupen',sessionadmin,blockCoupen)
router.get('/Oreders',sessionadmin,getOrderData)
router.get('/orderDetails/:id',sessionadmin,getOrderDetails)
router.get('/Banner',sessionadmin,viewBanner)
router.get('/addBanner',sessionadmin,AddBanner)
router.post('/postBanner',sessionadmin,fileupload.array("imageUrl",3),postBanner)
router.get('/bannerEdit/:id',sessionadmin,getBannerEdit)
router.post('/EditedBanner',sessionadmin,postEditedBanner)
router.get('/deleteBanner',sessionadmin,DeleteBanner)
router.get('/error',sessionadmin,geterror)
router.get('/orderStatus',sessionadmin,orderstatus)
router.get('/SalesReport',sessionadmin,salesReport)
router.get('/monthReport',sessionadmin,monthReport)
router.get('/yearReport',sessionadmin,yearRreport)
router.get('/ChartDetails',sessionadmin,GetChartDetails)
router.get('/pieChart',sessionadmin,getPieChartDetails)
router.post('/approveReturn',aprpoveReturn)

module.exports=router