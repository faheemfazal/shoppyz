const express=require('express')
const { PublishedTrackContext } = require('twilio/lib/rest/video/v1/room/roomParticipant/roomParticipantPublishedTrack')
const router=express.Router()
const fileupload=require('../middlewares/multerimg')
const productDb = require("../models/productmodel");
const {pagenation}=require('../middlewares/pagenation')
const {userSession,BlockUserChecke}=require('../middlewares/usersession')
const {
    getHomePage,
    getLogin,
    getSignup,
    postSignupData
    ,postUserLogin
    ,postOtp,
    otpResnd,
    getCatergory,
    productFullDetils,
    getAddtoCart,
    postRiview,
    cartview,
    userLogout,
    postcategory, 
    colurPage,
    incrementDecrimentOperationCart,
    deleteCart,
    viewProfile,
    postProfile,
    viewprofileDetails,
    geteditProfile,
    postEditedData,
    Deleteaddress,
    getechckout,
    verifycoupen,
    OfferPage, 
    postCheckout,
    orderComplited,
    orderproduct,
    OrderView,
    cancelOrder,
    userErrorPage,
    paypalOrder,
    verifyPayment,
    postreview,
    serchhome,
    shopsearch,
    resentotp,
    otp,
    forgetPasswerd,
    forgetPasswordPost,
    postotpverifypass,
    newPassword,
    getpostnewpass
            }=require('../controlls/usercontroller')
const { route } = require('./admin')

router.get('/',getHomePage)
router.get('/signup',getLogin)
router.get('/login',getSignup)
router.post('/signup',postSignupData)
router.post('/login',postUserLogin)
router.post('/otp',postOtp) 
router.get('/resend',otpResnd)
router.get('/usercategory',pagenation(productDb),getCatergory)
router.get('/productDetails/:id',productFullDetils)
router.get('/addToCart',userSession,BlockUserChecke,getAddtoCart)
router.post('/addRiview/:id',userSession,BlockUserChecke,postRiview)
router.post('/cart/:id',userSession,BlockUserChecke,cartview)
router.get('/logout',userLogout)
router.get('/selectedCategory/:id',userSession,postcategory)
router.get('/selectedColur/:id',userSession,colurPage)
router.patch('/cartButtonOperation',userSession,BlockUserChecke,incrementDecrimentOperationCart)
router.delete('/deleteCart',userSession,BlockUserChecke,deleteCart)
router.get('/profile',userSession,BlockUserChecke,viewProfile)
router.post('/addProfile',userSession,BlockUserChecke,fileupload.array("imageUrl",3),postProfile)
router.get('/viewProfile',userSession,BlockUserChecke,viewprofileDetails)
router.get('/EditProfile/:id',userSession,BlockUserChecke,geteditProfile) 
router.post('/editedProfile/:id',userSession,fileupload.array("imageUrl",3),postEditedData)
router.delete('/deliteProfile',userSession,Deleteaddress)
router.get('/checkout',userSession,getechckout)
router.post('/verifyCoupen',userSession,verifycoupen)
router.get('/Offer',userSession,OfferPage)
router.post('/checkOut',userSession,BlockUserChecke,postCheckout)
router.get('/OrderComplited',userSession,BlockUserChecke,orderComplited)
router.get('/Orders',userSession,BlockUserChecke,orderproduct)
router.get('/OrderProductview/:id',OrderView)
router.post('/orderCancel',cancelOrder)
router.get('/userError',userErrorPage)
router.post('/create-order',paypalOrder)
router.post('/verifyPayment',verifyPayment)
router.post('/review',postreview)
router.post('/getfruits',serchhome)
router.get('/shopview',shopsearch)
router.get('/resetOtp',resentotp)
router.get('/otp',otp)
router.get('/forgetPassword',forgetPasswerd)
router.post('/verifyEmailforgetPass',forgetPasswordPost)
router.post('/otpverify',postotpverifypass)
router.post('/postnewPass',newPassword)
router.get('/postnewPass',getpostnewpass)

module.exports=router


 




 

 