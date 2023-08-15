const { default: mongoose, Schema } = require("mongoose");
const userdb = require("../models/usermodel");
const mongoosedb = require("../config/connection");
const bycript = require("bcrypt");
const { sendotp, verifyotp } = require("../verification/otp");
const productDb = require("../models/productmodel");
const review = require("../models/rivewmodel");
const user = require("../models/usermodel");
// const user = require('../models/userModel')
const cartDb = require("../models/cartmodel");
const { response, checkout, render, request, map } = require("../app");
const { findOne } = require("../models/usermodel");
const AddressDb = require("../models/adress");
const categoryDb = require("../models/categarymodel");
const cart = require("../models/cartmodel");
const moment = require("moment");
const CoupenDb = require("../models/coupenmodel");
const bannerDb = require("../models/bannermodel");
const orderDb = require("../models/order");
const { Date } = require("mongoose/lib/schema/index");
const paypal = require("@paypal/checkout-server-sdk");
const { json } = require("express");
const reviewDb = require("../models/rivewmodel");

// const paypall= require('paypal-checkout')

const envirolment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

const paypalCliend = new paypal.core.PayPalHttpClient(
  new envirolment(process.env.PAYPAL_CLIND_ID, process.env.PAYPAL_CLIND_SECRET)
);

// var instance = new Razorpay({
//   key_id: 'YOUR_KEY_ID',
//   key_secret: 'YOUR_KEY_SECRET',
// });

sess = null;
const getHomePage = async (req, res) => {
  try {
    const homeproduct = await productDb.find().sort({ createdAt: -1 }).limit(8);
    const Banner = await bannerDb.find().sort({ createdAt: -1 });
    const users = req.session.user;
    const sess = req.session.loggedIn;
    const sum = req.session.cartSum;

    console.log(Banner);

    res.render("user/userhome", {
      homeproduct,
      sess,
      users: req.session.user,
      sum: req.session.cartSum,
      Banner,
    });
  } catch {
    res.redirect("/userError");
  }
};

// selectCategory

const postcategory = async (req, res) => {
  try {
    console.log(req.params);
    const category = req.params.id;
    const product = await productDb.find({ Category: category });
    console.log(product);

    res.render("user/sellectedCategoryProduct", { product });
  } catch {
    res.redirect("/userError");  }
};

// sellectColour

const colurPage = async (req, res) => {
  try{
    const colour = req.params.id;
    const colourData = await productDb.find({ Colour: colour });
    console.log(colourData);
  
    res.render("user/sellectedColurProduct", { colourData });
  }catch{
    res.redirect("/userError");  }

};

const getLogin = (req, res) => {
  try{

    res.render("user/userlogin",{ signupmsg:req.flash("loginsms")});
  }catch{
    res.redirect("/userError");  
  }
};

const getSignup = (req, res) => {
  try{
    res.render("user/createacc",{
      loginsms:req.flash("loginsms")
    });
  }catch{
    res.redirect("/userError");  

  }

};
const postSignupData = (req, res) => {
  try {
    // console.log(req.body)
    let loginsms;
    const { FirstName, SecondName, Email, Password, Confirm, Number } =
      req.body;
    console.log(Email + " " + Confirm + " " + Number);

    if (Password !== Confirm) {
      console.log("password not match");
      req.flash("loginsms","Paswerd is not match")
      res.redirect("/signup");
    } else {
      userdb.findOne({ Email: Email }).then((user) => {
        console.log("111111111111111111111111");
        console.log(user);
        if (user) {
          console.log("it's user");
          // req.flash("signupmsg","Already accound")
          res.redirect("/login");
        } else {
          console.log("wwwwwwwwwwwwwwwwwwwwwwww");
          let newdata = new userdb({
            FirstName: req.body.FirstName,
            SecondName: req.body.SecondName,
            Email: req.body.Email,
            Password: req.body.Password,
            Confirm: req.body.Confirm,
            Number: req.body.Number,
          });
          // console.log(newdata);

          bycript.genSalt(10, (err, salt) => {
            bycript.hash(newdata.Password, salt, (err, hash) => {
              if (err) throw err;
              newdata.Password = hash;
              newdata.Confirm = hash;
              // newdata.save()
              // .then(()=>{
              // req.session.user = req.body
              console.log(Number);
              sendotp(Number);
              //  console.log(req.body)

              console.log("222222222222222");
              console.log(req.session.user);

              res.render("user/validotp");

              // })
            });
          });
          req.session.user = req.body;
          console.log(req.session.user);
        }
      });
    }
  } catch {
    res.redirect("/userError");
  }
};

const postOtp = async (req, res) => {
  try {
    console.log(req.body);
    // console.log(req.session.user);

    const otp = req.body.otp;
    console.log(".........");
    const { FirstName, SecondName, Email, Password, Confirm, Number } =
      req.session.user;
    await verifyotp(Number, otp).then(async (verification_check) => {
      console.log("......" + verification_check);
      console.log("......" + verification_check.status);
      if (verification_check.status == "approved") {
        console.log("pppppppppp" + Password);
        const hashPassword = await bycript.hash(Password, 10);
        let newuser = new userdb({
          FirstName: FirstName,
          SecondName: SecondName,
          Email: Email,
          Password: hashPassword,
          Confirm: hashPassword,
          Number: Number,
        });
        newuser.save();
        res.redirect("/usercategory");
      } else {
        res.redirect("/otp");
      }
    });
  } catch {
    res.redirect("/userError");  

  }
};
const otpResnd = (req, res) => {
  try{

    res.redirect("/signup");
  }catch{
    res.redirect("/userError");  

  }
};

const postUserLogin = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    let loginsms;

    const loginDetails = await userdb.findOne({ Email: Email });

    if (loginDetails) {
      await bycript.compare(Password, loginDetails.Password, (err, data) => {
        if (err) throw err;
        else if (data) {
          req.session.loggedIn = true;
          req.session.user = loginDetails;

          console.log("bbbbbbbbbbb>>>>" + req.session.user);
          res.redirect("/usercategory");
         } else {
          req.session.loggedErr = "User Blocked By Admin";
          req.flash("loginsms","Wrong password")
          res.redirect("/login");
        }
      });
    } else {
      req.session.loggedErr = "user cannot find";
      req.flash("loginsms","Cannot Find User")
      res.redirect("/login");
    }
  } catch {
    res.redirect("/userError");  

  }
};

// category
const getCatergory = async (req, res) => {
  try {
    let allproduct;
    let cart;
    let totalCalc;
    const sortlimit = res.query;
    const pagenation = res.pagenation;
     allproduct = res.pagenation.results;
     console.log(req.query);
     console.log(req.query.category);

    // const allproduct = await productDb.find().limit(8)
    console.log(pagenation);
    // {"$group" : { "_id": "$name", "count": { "$sum": 1 } } },
    // {"$match": {"_id" :{ "$ne" : null } , "count" : {"$gt": 1} } },
    // const userId = req.session.user._id;
    const sess = req.session.loggedIn;

    

    if(req.query.color){
      
      allproduct = await productDb.find({ Colour: req.query.color });
    }

    if(req.query.category){
      console.log("dddd");
      allproduct = await productDb.find({ Category: req.query.category });

    }
    
    if(req.session.user){
      cart = await cartDb.findOne({ Owner: req.session.user._id });

      console.log("card approve" + cart);
      const totalCalc = await cartDb.aggregate([
        { $match: { Owner: mongoose.Types.ObjectId(req.session.user._id) } },
        { $unwind: { path: "$items" } },
        // {$group:{_id:"$_id","countCart":{$sum:1}}},
        { $project: { "items.quantity": 1, _id: 0 } },
      ]);

      var sum = 0;

      totalCalc.forEach((el) => {
        sum += el.items.quantity;
      });
    }

  

    console.log("coming");
    console.log(req.query);
    let productList;
    const typeData = {
      typelisting: "listing",
      key: null,
    };
    if (req.query.q) {
      (typeData.typelisting = "qListing"), (typeData.key = req.query.q);
      try {
        const skey = req.query.q;
        allproduct = await productDb.find({ _id: skey });
        console.log(productList);
      } catch {
        res.redirect("/userError");  

      }
    }



    req.session.cartSum = sum;

    const colour = await productDb.aggregate([
      {
        $group: { _id: "$Colour" },
      },
      {
        $match: { _id: { $ne: null } },
      },
    ]);

    const category = await productDb.aggregate([
      {
        $group: { _id: "$Category" },
      },
      {
        $match: { _id: { $ne: null } },
      },
    ]);
    console.log(colour);
    console.log(category);
    console.log(allproduct);

    res.render("user/categoryuser", {
      allproduct,
      category,
      colour,
      sess,
      users: req.session.user,
      sum,
      pagenation,
    });
  } catch (e) {
    console.log(e);
    res.redirect("/userError");  

  }
};

const productFullDetils = async (req, res) => {
  try {
    const sess = req.session.loggedIn;
    const sum = req.session.cartSum;
    console.log(req.params.id);
    const productId = req.params.id;
    const findProduct = await productDb.findById({ _id: productId });
    console.log(findProduct);

    const Rewiew = await reviewDb
      .find({ products: productId })
      .populate("User");
    console.log("........");
    console.log(Rewiew);

    const starrating = findProduct.rating / findProduct.review;

    res.render("user/productdetails", {
      findProduct,
      sess,
      sum,
      Rewiew,
      starrating,
    });
  } catch {
    res.redirect("/userError");  

  }
};
// review

const postRiview = (req, res) => {
  try {
    console.log(req.params.id);
    const productId = req.params.id;

    res.redirect(`/ProductDetails/${productId}`);
  } catch {
    res.redirect("/userError");  

  }
};

//  cart
showCart = null;
const getAddtoCart = async (req, res) => {
  try {
    let sess =req.session.loggedIn 
   
    let sum =0


    const user_id = req.session.user._id;
    const address = await AddressDb.findOne({ User: user_id });
    console.log(address);
    console.log("dddd");
    const product = await cartDb
      .find({ Owner: user_id })
      .populate("items.ProductDetails")
      .exec((err, allcart) => {
        console.log("1111" + allcart);
        if (err) {
          return console.log(err);
          console.log("....r.....");
          // res.render('user/cartEmpty', {
          //   users: req.session.user,sess,
          //   showCart: true,
          //   sess,sum
          // })
        } else {
          if (allcart.length == !0) {
            console.log("....rr.....",allcart);
            allcart[0].items.filter((data)=>{
              console.log(data.quantity);
              sum += data.quantity
            })
            const TotalPrice = allcart[0].totalCart;
            const cartproduct = allcart[0].items;
            const cartId = allcart[0]._id;
            console.log(TotalPrice);
            console.log(cartproduct);
            console.log(sess,'ooooooooooooooooooooooo');
            res.render("user/addtocart", {
              cartproduct,
              allcart,
              TotalPrice,
              users: req.session.user,
              cartId,
              showCart: true,
              sess,
              sum,
              address,
            });
          } else {
            res.render("user/cartempty", {
              users: req.session.user,
              sess,
              showCart: true,
              sess,
              sum,
            });
          }
        }
      });
  } catch {
    res.redirect("/userError");  

  }
};

const cartview = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.user._id;

    const user = await cartDb.findOne({ Owner: req.session.user._id });
    const product = await productDb.find({ _id: productId });

    if (product[0].Quantity < 1) {
      res.json("outstock");
      req.flash("quantityIssue", "Out Of Stock");
    } else {
      const productPrice = product[0].Offer;
      if (!user) {
        const userId = req.session.user._id;
        const addToCart = await cartDb({
          Owner: req.session.user._id,
          items: [{ ProductDetails: productId, total: product[0].Offer }],
          totalCart: productPrice,
        });

        addToCart.save().then((resp) => {
          // res.json("Success");
          res.json({ status: "Success" });
        });
      } else {
        const existProduct = await cartDb.findOne({
          Owner: userId,
          "items.ProductDetails": productId,
        });
        if (existProduct) {
          const quantityChaeque = await cartDb.aggregate([
            {
              $match: { Owner: mongoose.Types.ObjectId(req.session.user._id) },
            },
            { $unwind: { path: "$items" } },
            {
              $match: {
                "items.ProductDetails": mongoose.Types.ObjectId(productId),
              },
            },
          ]);

       

          if (product[0].Quantity <= quantityChaeque[0].items.quantity) {
            res.json("outstock");
          } else {
            await cartDb
              .updateOne(
                {
                  Owner: userId,
                  "items.ProductDetails": productId,
                },
                {
                  $inc: {
                    "items.$.quantity": 1,
                    "items.$.total": product[0].Offer,
                    totalCart: product[0].Offer,
                  },
                }
              )
              .then((response) => {
                res.json({ status: "Success" });
              })
              .catch((err) => {
              });

          }
        } else {
          await cartDb
            .updateOne(
              {
                Owner: req.session.user._id,
              },
              {
                $push: {
                  items: {
                    ProductDetails: productId,
                    total: productPrice,
                  },
                },
                $inc: {
                  totalCart: productPrice,
                },
              }
            )
            .then((response) => {
              res.json({ status: "Success" });
            });
        }
      }
    }
  } catch {
    res.redirect("/userError");  
  }
};

const incrementDecrimentOperationCart = async (req, res) => {
  try {
    console.log(req.query,';;;;');
    const cartId = req.query.cartId;
    const productId = req.query.productId;
    const action = req.query.action;

    // const productQuantity=await cartDb.aggregate([{
    //   $match:{}
    // }])
    const product = await productDb.findOne({ _id: productId });
    console.log(product);

    const quantityChaeque = await cartDb.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(cartId) } },
      { $unwind: { path: "$items" } },
      {
        $match: { "items.ProductDetails": mongoose.Types.ObjectId(productId) },
      },
    ]);
    const quantity = quantityChaeque[0].items.quantity;
    if (product.Quantity <= quantity && action == 1) {
      
      res.json({ stockReached: true });
    } else {
      const productprice = await productDb.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(productId) } },
        { $project: { Offer: 1 } },
      ]);
      const price = productprice[0].Offer;
      console.log(quantityChaeque[0].items.quantity,';;;;;;;;;;;;;;;');
   

      if (quantityChaeque[0].items.quantity <= 1) {
        console.log("ddddd");
        if (action == 1) {
          await cartDb.updateOne(
            {
              _id: mongoose.Types.ObjectId(cartId),
              "items.ProductDetails": productId,
            },
            {
              $inc: {
                "items.$.quantity": action,
                "items.$.total": price,
                totalCart: price,

              },
            }
          );
        } else {
          await cartDb.updateOne(
            {
              _id: mongoose.Types.ObjectId(cartId),
              "items.ProductDetails": productId,
            },
            {
              $inc: {
                "items.$.quantity": 0,
                "items.$.total": 0,
                totalCart: -price,

              },
            }
          );
        }
        res.json({
          access: true,
          stat: "error",
          msg: "product quantity lessthan 1",
        });
      } 
      else {
        console.log('ooooooooo');
        if (action == 1) {
          await cartDb.updateOne(
            {
              _id: mongoose.Types.ObjectId(cartId),
              "items.ProductDetails": productId,
            },
            {
              $inc: {
                "items.$.quantity": action,
                "items.$.total": price,
                totalCart: price,
              },
            }
          );
        } else {
          await cartDb.updateOne(
            {
              _id: mongoose.Types.ObjectId(cartId),
              "items.ProductDetails": productId,
            },
            {
              $inc: {
                "items.$.quantity": action,
                "items.$.total": -price,
                totalCart: -price,
              },
            }
          );
        }
        res.status(200).json({
          access: true,
          stat: "success",
          msg: "added cart",
        });
      }
    }

    // await cartDb.updateOne({
    //   Owner: userId,
    //   "items.ProductDetails": productId
    // }, {
    //   $inc: {
    //     "items.$.quantity": 1,
    //     "items.$.total": product[0].Offer,
    //     totalCart: productPrice
    //   }

    // })
    console.log(cartId);
    console.log("eeeeee");
    console.log(quantityChaeque);
  } catch {
    res.redirect("/userError");  

  }
};

const deleteCart = async (req, res) => {
  try {
    console.log(req.query);
    const user = req.session.user;
    console.log(req.session.user._id);
    const productId = req.query.productId;
    const product = await productDb.findOne({ _id: productId });
    console.log("fsdgsfdg");
    const cart = await cartDb.findOne({ Owner: req.session.user._id });

    console.log(cart);
    const index = await cart.items.findIndex((el) => {
      return el.ProductDetails == productId;
    });
    console.log(index);
    const price = cart.items[index].total;
    console.log(price);

    const deletecart = await cartDb.updateOne(
      { Owner: req.session.user._id },
      {
        $pull: {
          items: { ProductDetails: productId },
        },
        $inc: { totalCart: -price },
      }
    );

    console.log("sssssss");
    res.json("sucess");
    console.log("sssssss");
  } catch {}
};
const viewProfile = (req, res) => {
  try {
    const sess = req.session.loggedIn;
    const sum = req.session.cartSum;
    res.render("user/viewprofile", { sess, sum });
  } catch {
    res.redirect("/userError");  

  }
};

const postProfile = async (req, res) => {
  try {
    console.log(req.body);
    const data = { ...req.body };
    console.log(req.files);
    const {
      Fullname,
      number,
      pinCode,
      State,
      City,
      houseaddress,
      roadaddress,
    } = req.body;

    // console.log(Fullname+" "+number+" "+pinCode+" "+State+" "+City+" "+houseaddress+" "+roadaddress)
    const userId = req.session.user._id;
    Object.assign(req.body, { imageUrl: req.files });
    console.log(req.body);
    const existAddress = await AddressDb.findOne({ User: userId });
    if (
      Fullname &&
      number &&
      pinCode &&
      State &&
      City &&
      houseaddress &&
      roadaddress
    ) {
      if (req.files.length !== 0) {
        console.log("approve");

        console.log(existAddress);

        if (existAddress) {
          console.log("approve");

          console.log("dfsgsd33fgdsfg");
          await AddressDb.updateOne(
            { User: userId },
            {
              $push: {
                Address: [req.body],
              },
            }
          );
          res.redirect("/viewProfile");
        } else {
          const addAddress = await AddressDb({
            User: req.session.user._id,
            Address: [req.body],
          });
          addAddress.save().then((ans) => {
            console.log(ans);
          });
          res.redirect("/viewProfile");
        }
      } else {
        if (existAddress) {
          await AddressDb.updateOne(
            { User: userId },
            {
              $push: {
                Address: [data],
              },
            }
          );
          res.redirect("/viewProfile");
        } else {
          const addAddress = await AddressDb({
            User: req.session.user._id,
            Address: [data],
          });
          addAddress.save().then((ans) => {
            console.log(ans);
          });
          res.redirect("/viewProfile");
        }
      }
    }
    console.log("approve");
  } catch {
    res.redirect("/userError");  

  }
};
const viewprofileDetails = async (req, res) => {
  try {
    const sess = req.session.loggedIn;
    const sum = req.session.cartSum;
    const userId = req.session.user._id;
    console.log(userId);
    const findWallet = await userdb.findById(userId);
    console.log(findWallet.wallet);
    console.log("ddddd");
    const findAddress = await AddressDb.findOne({ User: userId });

    console.log(findAddress);
    if (findAddress) {
      res.render("user/viewuseraddress", {
        findAddress,
        sess,
        sum,
        deliteConfirm: req.flash("deliteConfirm"),
        wallet: findWallet.wallet,
      });
    } else {
      res.render("user/emptyaddress", { sess, sum });
    }
  } catch {
    res.redirect("/userError");  

  }
};

// geteditProfile

const geteditProfile = async (req, res) => {
  try {
    const sess = req.session.loggedIn;
    const sum = req.session.cartSum;
    console.log(req.params.id);
    const AddressUser = await AddressDb.findOne({ User: req.session.user._id });
    const editAddress = AddressUser.Address.find(
      (el) => el._id.toString() === req.params.id
    );
    console.log(AddressUser);
    console.log("AddressUser");
    console.log(editAddress);

    res.render("user/editprofiledata", { editAddress, sess, sum });
  } catch {
    res.redirect("/userError");  

  }
};

// posteditProfile

const postEditedData = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.params.id);
    console.log(req.files);
    const AddressId = req.params.id;
    const { Fullname, number, pinCode, State, houseaddress, roadaddress } =
      req.body;
    if (Fullname && number && pinCode && State && houseaddress && roadaddress) {
      if (req.files.length === 0) {
        console.log("fff");
        const editAddress = await AddressDb.updateMany(
          {
            "Address._id": AddressId,
          },
          {
            $set: {
              "Address.$.Fullname": Fullname,
              "Address.$.number": number,
              "Address.$.pinCode": pinCode,
              "Address.$.State": State,
              "Address.$.houseaddress": houseaddress,
              "Address.$.roadaddress": roadaddress,
            },
          },
          {
            upsert: true,
          }
        );
        res.redirect("/viewProfile");
      } else {
        console.log("rrrrr");
        const editAddress = await AddressDb.updateMany(
          {
            "Address._id": AddressId,
          },
          {
            $set: {
              "Address.$.Fullname": Fullname,
              "Address.$.number": number,
              "Address.$.pinCode": pinCode,
              "Address.$.State": State,
              "Address.$.houseaddress": houseaddress,
              "Address.$.roadaddress": roadaddress,
              "Address.$.imageUrl": req.files,
            },
          },
          {
            upsert: true,
          }
        );
        res.redirect("/viewProfile");
      }
      console.log("ss");
    } else {
      // inter Fullname
    }
  } catch {
    res.redirect("/userError");  

  }
};

// deleteProfile

const Deleteaddress = async (req, res) => {
  try {
    const userId = req.session.user._id;

    const count = await AddressDb.aggregate([
      {
        $match: { User: mongoose.Types.ObjectId(userId) },
      },
      { $unwind: { path: "$Address" } },
      { $count: "total" },
    ]);
    console.log(count[0].total);
    const total = count[0].total;

    if (total === 1) {
      req.flash("deliteConfirm", "Can't Delete Last Address");
      return res.json({
        access: false,

        msg: "1 address must needed",
      });
    } else {
      const addressId = req.query.addressId;

      await AddressDb.updateOne(
        { User: userId },
        {
          $pull: {
            Address: { _id: addressId },
          },
        }
      );
      return res.json({
        access: true,

        msg: "complited",
      });
    }
  } catch {
    res.redirect("/userError");  

  }
};

// checkout page

const getechckout = async (req, res) => {
  try {
    const user = req.session.user;
    const sess = req.session.loggedIn;
    const sum = req.session.cartSum;
    const navcat = await categoryDb.find();
    const cartProduct = await cart
      .findOne({ Owner: user._id })
      .populate("items.ProductDetails");
    console.log(cartProduct);
    console.log(navcat);
    console.log(cartProduct.items);

    if (cartProduct.items.length > 0) {
      const address = await AddressDb.findOne({ User: user._id });
      console.log("3333333....." + address);
      res.render("user/checkoutpag", {
        address,
        user,
        total: cartProduct.totalCart,
        product: cartProduct.items,
        cartProduct,
        sess,
        sum,
        paypalClindId: process.env.PAYPAL_CLIND_ID,
      });
    } else {
      res.redirect("/addToCart", { sess, sum });
    }
  } catch {
    res.redirect("/userError");  

  }
};
const verifycoupen = async (req, res) => {
  try {
    console.log(req.body);
    const coupenCode = req.body.coupenCode;
    const total = req.body.total;
    console.log("dsafd");
    let coupensms;
    let calculateTotal;
    console.log("dsafd");
    // let nowDate= moment(Date.now()).format("DD/MM/YYYY");
    const nowDate = moment().toDate()
    console.log("dsafd");
    const coupen = await CoupenDb.find({
      code: coupenCode,
      status: "ACTIVE",
    });
    console.log(coupen);
    if (coupen.length == 0) {
      coupensms = "Coupen Invalid";
      res.json({ status: false, coupensms });
    } else {
      const expireAfter = coupen[0].expireAfter
      const persentage = coupen[0].percentage;
      const usageLimit = coupen[0].usageLimit;
      const amount = coupen[0].amount;
      const minCartAmount = coupen[0].minCartAmount;
      const maxRedeemAmounnt = coupen[0].maxCartAmount;
      console.log(expireAfter);
      console.log(nowDate);
      if (nowDate < expireAfter) {
        console.log("working");
        if (persentage == false) {
          console.log("amount");
          if (minCartAmount > total) {
            console.log("less amount");
            coupensms =
              "Minimum $ " + minCartAmount + " needed to applay this coupen";
            res.json({ status: false, coupensms });
          } else {
            console.log("high amout");
            console.log(total);
            calculateTotal = Math.round(total - amount);
            let response = {
              statuse: true,
              calculateTotal: calculateTotal,
              coupensms,
              cutOff: amount,
            };
            res.json(response);
          }
        } else {
          console.log("persentage");
          if (minCartAmount > total) {
            console.log("-ve persentsge");
            coupensms =
              "Minimum $ " + minCartAmount + " needed to applay this coupen";
            res.json({ status: false, coupensms });
          } else {
            if (amount > 100) {
              calculateTotal = Math.round(total - amount);
              let response = {
                statuse: true,
                calculateTotal: calculateTotal,
                coupensms,
                cutOff: amount,
              };
              res.json(response);
            } else {
              console.log("cash");
              let reduceAmount = Math.round((total * amount) / 100);
              if (reduceAmount > maxRedeemAmounnt) {
                calculateTotal = Math.round(total - maxRedeemAmounnt);
                let response = {
                  statuse: true,
                  calculateTotal: calculateTotal,
                  coupensms,
                  cutOff: maxRedeemAmounnt,
                };
                res.json(response);
              } else {
                calculateTotal = Math.round(total - reduceAmount);

                let response = {
                  statuse: true,
                  calculateTotal: calculateTotal,
                  coupensms,
                  cutOff: reduceAmount,
                };
                res.json(response);
              }
            }
          }
        }
      } else {
        let coupensms = "coupen date expired";
        res.json({ statuse: false, coupensms });
      }
    }
  } catch {
    res.redirect("/userError");  

  }
};

// post checkout
const postCheckout = async (req, res) => {
  try {
    // const request = new paypal.orders.OrdersCreateRequest();

    console.log(req.body);
    console.log(req.query);
    let use = req.session.user;
    let userId = req.session.user._id;
    let grandTotal = req.body.total - req.query.coupenAmount;
    let coupenAmount = req.query.coupenAmount;

    console.log(req.body.cartId);

    const cartdata = await cartDb
      .findOne({ Owner: req.session.user._id })
      .populate("items.ProductDetails");
    console.log(cartdata);
    const cartProduct = cartdata.items;
    console.log("fffff");
    console.log(cartProduct);
    console.log(cartProduct.ProductDetails);

    let outofstock = [];
    for (let i = 0; i < cartProduct.length; i++) {
      console.log(i);
      if (cartProduct[i].quantity > cartProduct[i].ProductDetails.Quantity) {
        console.log("out of stock");
        outofstock.push(cartProduct[i].ProductDetails.ProductName);
      }
    }
    if (outofstock.length != 0) {
      console.log("1 product out of stock");
      res.json({ outofproduct: true, outofstock });
    } else {
      console.log(outofstock);
      if (req.body.address) {
        console.log("dsgdfgs");
        let coupen = await CoupenDb.findOne({ code: req.body.coupencode });
        if (coupen) {
          var coupendis = grandTotal - coupenAmount;
        }
        const paymentMethod = req.body.paymentMethod;
        const address = await AddressDb.findOne({ User: userId });
        const DeliveryAddress = address.Address.find(
          (el) => el._id.toString() === req.body.address
        );

        const cart = await cartDb.findOne({ Owner: req.session.user._id });
        const cartProduct = cart.items;
        const date = moment().format("DD/MM/YYYY");

        // const time= new Date().toLocaleTimeString()
        // console.log(time);
        if (req.body.paymentMethod === "cash on delivery") {
          console.log("cash on delivery");
          const newOrder = await orderDb({
            date: moment().format("DD/MM/YYYY"),
            time: moment().toDate().getTime(),
            userId: userId,
            products: cart.items,
            coupenDiscount: coupenAmount,
            address: DeliveryAddress,
            totalAll: grandTotal,
            PaymentMethod: paymentMethod,
            paymentStatuse: "payment pending",
            OrderStatuse: "order Confirmed",
            track: "order Confirmed",
          });
          newOrder.save().then(async (response) => {
            req.session.OrderId = response._id;
            const order = await orderDb.findOne({ _id: response._id });
            console.log("pppppppp");
            const findproductId = order.products;
            console.log(findproductId);
            findproductId.forEach(async (el) => {
              let updateProductData = await productDb.updateMany(
                {
                  _id: el.ProductDetails,
                },
                {
                  $inc: {
                    Quantity: -el.quantity,
                  },
                }
              );
            });
            console.log("wwww");
            if (coupen) {
              console.log("have Coupen");
              let cartCount = await CoupenDb.updateMany(
                {
                  _id: coupen._id,
                },
                {
                  $inc: {
                    usageLimit: -1,
                  },
                }
              );
            }

            await cartDb
              .findOneAndRemove({ Owner: order.userId })
              .then((result) => {
                res.json({ cashOnDelivery: true });
              });
          });
          console.log("dfsdfgsdfgeeeeeeee");
        } else if (req.body.paymentMethod === "Wallet") {
          console.log("Wallet");
          const user = await userdb.findOne({ _id: req.session.user._id });
          const walletBalance = user.wallet;
          console.log(walletBalance);
          if (walletBalance <= 0) {
            console.log("balannce 0");
            res.json({ noBalance: true });
          } else {
            if (walletBalance < grandTotal) {
              const balancePayment = grandTotal - walletBalance;
              console.log(balancePayment);
              const newOrder = await orderDb({
                date: moment().format("DD/MM/YYYY"),
                time: moment().toDate().getTime(),
                userId: userId,
                products: cart.items,
                coupenDiscount: coupenAmount,
                address: DeliveryAddress,
                totalAll: grandTotal,
                PaymentMethod: "Wallet",
                paymentStatuse: "paypal Pending",
                OrderStatuse: "order Confirmed",
                track: "order Confirmed",
              });
              newOrder.save().then(async (result) => {
                let userOrderData = result;
                console.log(userOrderData);
                req.session.orderId = result._id;
                id = result._id.toString();
                console.log(id);

                console.log("wwwwwwwwwww");

                console.log(",,,,,,,");

                let response = {
                  Razorpay: true,
                  walletBalance: balancePayment,
                  walletamount: walletBalance,
                  userOrderData: userOrderData,
                };
                res.json(response);
              });
            } else {
              console.log("only wallet");
              const newOrder = await orderDb({
                date: moment().format("DD/MM/YYYY"),
                time: moment().toDate().getTime(),
                userId: userId,
                products: cart.items,
                coupenDiscount: coupenAmount,
                address: DeliveryAddress,
                totalAll: grandTotal,
                PaymentMethod: "Wallet",
                paymentStatuse: "payment complited",
                OrderStatuse: "order Confirmed",
                track: "order Confirmed",
              });
              newOrder.save().then(async (result) => {
                req.session.OrderId = result._id;
                const order = await orderDb.findOne({ _id: result._id });
                console.log(order);
                console.log("pppppppp");
                const findproductId = order.products;
                console.log(findproductId);
                findproductId.forEach(async (el) => {
                  let updateProductData = await productDb.updateMany(
                    {
                      _id: el.ProductDetails,
                    },
                    {
                      $inc: {
                        Quantity: -el.quantity,
                      },
                    }
                  );
                });
                let orderWallet = await orderDb.findByIdAndUpdate(
                  { _id: result._id },
                  {
                    $set: {
                      useWallet: grandTotal,
                    },
                  }
                );
                let walletAmount = await userdb.findOneAndUpdate(
                  { _id: userId },
                  { $inc: { wallet: -grandTotal } }
                );
                if (coupen) {
                  console.log("have Coupen");
                  let cartCount = await CoupenDb.updateMany(
                    {
                      _id: coupen._id,
                    },
                    {
                      $inc: {
                        usageLimit: -1,
                      },
                    }
                  );
                  console.log(coupen);
                  console.log("hello");
                }
                await cartDb
                  .findOneAndRemove({ Owner: order.userId })
                  .then((result) => {
                    console.log("success wallet");
                    res.json({ Wallet: true });
                  });
              });
            }
          }
        } else if (req.body.paymentMethod === "paypal") {
          const paymentMethod = req.body.paymentMethod;
          console.log("qqqq");
          console.log(paymentMethod);
          const newOrder = await orderDb({
            date: moment().format("DD/MM/YYYY"),
            time: moment().toDate().getTime(),
            userId: userId,
            products: cart.items,
            coupenDiscount: coupenAmount,
            address: DeliveryAddress,
            totalAll: grandTotal,
            PaymentMethod: "paypal",
            paymentStatuse: "paypal Pending",
            OrderStatuse: "order Confirmed",
            track: "order Confirmed",
          });
          newOrder.save().then(async (result) => {
            let userOrderData = result;
            console.log(userOrderData);
            req.session.orderId = result._id;
            id = result._id.toString();
            console.log(id);

            console.log("wwwwwwwwwww");

            console.log(",,,,,,,");

            let response = {
              Razorpay: true,
              walletBalance: grandTotal,
              // razorpayOrderData: order,
              userOrderData: userOrderData,
            };
            res.json(response);
          });
        }
      } else {
        res.json({ noAddress: true });
      }
    }
  } catch {
    res.redirect("/userError");  

  }
};
// paypal

const paypalOrder = async (req, res) => {
  try{
    const request = new paypal.orders.OrdersCreateRequest();

    console.log("////////");
    console.log(req.body.items[0].amount);
    const balance = req.body.items[0].amount;
  
    console.log("jj");
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: balance,
  
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: balance,
              },
            },
          },
        },
      ],
    });
    try {
      console.log(",,,,,,,");
      const order = await paypalCliend.execute(request);
      console.log(".........");
      console.log(order);
      console.log(order.result.id);
      res.json({ id: order.result.id });
    } catch (e) {
      console.log("....,.,mmm");
      console.log(e);
      res.status(500).json(e);
    }
  }catch{
    res.redirect("/userError");  

  }

};

const verifyPayment = async (req, res) => {
  try {
    console.log("verifyPayment");
    console.log(req.body);
    let userOrderDataId = req.body.verifyData.userOrderData._id;
    // let paymentId=
    // let paymentSignature;
    // let userOrderDataId;
    await orderDb
      .findByIdAndUpdate(userOrderDataId, {
        OrderStatuse: "order Confirmed",
        paymentStatuse: "payment complited",
      })
      .then(async (result) => {
        console.log("spspssps");
        console.log(result);
        if (result.PaymentMethod == "Wallet") {
          console.log("verify vallet");
          let order = await orderDb.findByIdAndUpdate(
            { _id: userOrderDataId },
            {
              $set: {
                useWallet: req.body.walletBalance,
              },
            }
          );
          let walletAmount = await userdb.findOneAndUpdate(
            { _id: req.session.user._id },
            { $inc: { wallet: -req.body.walletBalance } }
          );
        }
        const findProductId = result.products;
        findProductId.forEach(async (el) => {
          let removeQuantity = await productDb.findOneAndUpdate(
            { _id: el.ProductDetails },
            { $inc: { Quantity: -el.quantity } }
          );
        });

        // coupenCode cecke

        console.log(req.body.coupenCode);
        let coupon = await CoupenDb.findOne({ code: req.body.coupenCode });
        if (coupon) {
          let cartCount = await CoupenDb.findOneAndUpdate(
            { _id: coupon._id },
            { $inc: { usageLimit: -1 } }
          );
        }

        await cartDb
          .findOneAndRemove({ Owner: req.session.user._id })
          .then((result) => {
            res.json({ status: true });
          });
      });
  } catch {
    res.redirect("/userError");  

  }
};

const orderComplited = (req, res) => {
  try {
    const userId = req.session.user._id;

    res.render("user/complitedorder");
  } catch {
    res.redirect("/userError");  

  }
};

const OfferPage = async (req, res) => {
  try {
    console.log("ddd");
    const coupens = await CoupenDb.aggregate([
      { $match: { status: "ACTIVE" } },
      { $project: { _id: 0 } },
    ]);

    // // const expireAfter=coupen[0].expireAfter.toLocaleDateString()
    coupens.forEach(
      (el) => (el.expireAfter = el.expireAfter.toLocaleDateString())
    );
    console.log(coupens);
    res.render("user/coupens", { coupens });
  } catch {
    res.redirect("/userError");  

  }
};

const orderproduct = async (req, res) => {
  try {
    const order = await orderDb
      .find({ userId: req.session.user._id })
      .sort({ createdAt: -1 });
    console.log(order);
    res.render("user/yourorders", { order });
  } catch {
    res.redirect("/userError");  

  }
};

const OrderView = async (req, res) => {
  try {
    const userId = req.session.user._id;
    console.log(req.params.id);
    const order = await orderDb
      .findOne({ _id: req.params.id })
      .populate("products.ProductDetails");

    // const wallet= await userdb.aggregate([{

    // }])
    console.log(order);
    console.log(order.products);
    res.render("user/vieworderproduct", {
      order,
      Products: order.products,
    });
  } catch {
    res.redirect("/userError");  

  }
};

const cancelOrder = async (req, res) => {
  try {
    let message;
    const orderid = req.query.orderId;
    const total = req.query.total;
    const userId = req.session.user._id;
    console.log(userId);
    const order = await orderDb.findById(orderid);
    console.log(order);
    console.log("ffffff");
    if (order.OrderStatuse == "Delivered") {
      // const updateWallet = await userdb.updateOne(
      //   {
      //     _id: userId,
      //   },
      //   {
      //     $inc: {
      //       wallet: total,
      //     },
      //   }
      // );
      const cancelOrder = await orderDb.findByIdAndUpdate(orderid, {
        OrderStatuse: "Returned",
        track: "Returned",
      });

      coupensms = "Amount added wallet";
      console.log(updateWallet);
      // res.json({ status: false, coupensms });
    } else {
      const cancelOrder = await orderDb.findByIdAndUpdate(orderid, {
        OrderStatuse: "Order Canceled",
        track: "Order Canceled",
      });
      console.log("aaaaaaaaa");
      console.log(cancelOrder);
    }
    coupensms = "Order canceled";
    res.json({ status: false, coupensms });
  } catch {
    res.redirect("/userError");  

  }
};

const postreview = (req, res) => {
  try {
    console.log(req.body);
    console.log(req.query);
    let { riview, rating } = req.body;
    console.log(rating);
    // rating=rating*20
    console.log(rating);
    rating = parseInt(rating);
    const products = req.query.productId;
    console.log(req.body);
    Object.assign(req.body, {
      User: req.session.user._id,
      products: req.query.productId,
      rating: rating,
    });
    console.log(req.body.rating);
    reviewDb
      .findOneAndReplace(
        { products: products, User: req.session.user._id },
        req.body
      )
      .then(async (response) => {
        console.log(response);
        if (response) {
          console.log("reaskfdja");
          console.log(response);
          let rat = ({} = await productDb.findById(products, {
            _id: 0,
            rating: 1,
            review: 1,
          }));
          console.log(rat);
          rating = rat.rating - response.rating + req.body.rating;
          console.log(rating);

          await productDb.findByIdAndUpdate(products, {
            $set: { rating: rating },
          });
          res.json();
        } else {
          console.log("jhsdfjhfdghb");
          const newReview = await new reviewDb(req.body);
          await newReview.save().then(async (result) => {
            console.log(result);
            await productDb.findByIdAndUpdate(products, {
              $inc: { review: 1, rating: rating },
            });
            //   let rat = {} = await productDb.findById(products, { _id: 0, rating: 1 ,review:1});
            //   console.log(rat);
            //   rating=(rat.rating+rating - response.rating)/rat.review
            //  console.log(rating);
            //  await productDb.findByIdAndUpdate(products,{$set:{rating:rating}})
            res.json();
          });
        }
      });
  } catch (e) {
    console.log(e);
    res.redirect("/userError");  

  }
};

const serchhome = async (req, res) => {
  try{
    const sResult = [];
    const skey = req.body.payload;
    console.log(skey);
    const regex = new RegExp("^" + skey + ".*", "i");
    console.log(regex);
    const pros = await productDb.aggregate([
      {
        $match: {
          $or: [{ ProductName: regex }, { Discription: regex }],
        },
      },
    ]);
    console.log(pros);
    // pros=pros.slice(0,5)
    pros.forEach((val, i) => {
      sResult.push({ title: val.ProductName, type: "product", id: val._id });
    });
    console.log(sResult);
  
    // const catlist =await categoryDb.aggregate([
    //   {
    //     $match:{
    //       categary:{$eq:regex}
    //     }
    //   }
    // ])
    // console.log("//////////");
    // console.log(catlist);
    // catlist.forEach((val,i)=>{
    //   sResult.push({title:val.categary,type:"category", id:val._id})
    //   console.log(sResult[0]);
    //   res.send()
    // })
  
    // console.log(req.body);
    // let payload= req.body.payload.trim()
    // console.log(payload);
    // let search= await productDb.find({ProductName:{$regex: new RegExp('^'+payload+'.*','i')}}).exec()
    const result = sResult.slice(0, 5);
    console.log(result);
  
    // console.log(search);
    res.send({ payload: result });
  }catch{
    res.redirect("/userError");  

  }

};

const shopsearch = async (req, res) => {
  // console.log("coming");
  // console.log(req.query);
  // let productList;
  // const typeData = {
  //   typelisting: "listing",
  //   key: null,
  // };
  // if (req.query.q) {
  //   (typeData.typelisting = "qListing"), (typeData.key = req.query.q);
  //   try {
  //     const skey = req.query.q;
  //     productList = await productDb.find({ _id: skey });
  //     console.log(productList);
  //   } catch {}
  // }
};

const resentotp=(req,res)=>{
  try{
    console.log("dkfhfkdfhf");
    const {Number}=req.session.user
    console.log(Number);
    const number=Number
    sendotp(number);
    res.redirect('/otp')
  }catch{
    res.redirect("/userError");  

  }

}

const userErrorPage = (req, res) => {
  res.render("user/usererror");
};

const userLogout = (req, res) => {
  try{
    req.session.destroy();
    res.redirect("/login");
  }catch{
    res.redirect("/userError");  

  }

};
const otp=(req,res)=>{
  try {
    res.render('user/validotp')
  } catch (error) {
    console.log(error);
  }
}

const forgetPasswerd=(req,res)=>{

    console.log("sfhfgh");
    res.render('user/forgetpassword')
    let response;
}
const forgetPasswordPost=async(req,res)=>{

  try{
    let proAdd;
    console.log("dfsdfhsddrdddddd");
    console.log(req.body);
    
    const userfind= await userdb.findOne({Email:req.body.Email})
    if(userfind){
     const number= parseInt(req.body.number)
     sendotp(number);
     req.session.number=number
     req.session.passEmail=req.body.Email
     res.render('user/OtppassCange')
 
      
   }else{
     res.flash('proAdd',"wrong email")
     res.redirect('forgetPassword')
    }
  }catch(e){
    
  }


}

const postotpverifypass=async(req,res)=>{
     console.log(req.body.otp)
     await verifyotp(req.session.number, req.body.otp).then(async (verification_check) => {
      console.log("......" + verification_check);
      console.log("......" + verification_check.status);
      if (verification_check.status == "approved") {
         console.log("succ");
         res.redirect('/postnewPass')
         

      }else{

      }

    })



}


const newPassword=async(req,res)=>{
  try{
    console.log(req.body);
    let pass;
    let ndPass;
        let loginsms;
  
    console.log(req.body.password);
    const password= req.body.password.toString()
    console.log(password);
  
    if(req.body.password == req.body.confirmPass){
    bycript.genSalt(10, (err, salt) => {
      bycript.hash(password, salt, async(err, hash) => {
        if (err) throw err;
        pass = hash;
        ndPass = hash;
        console.log(pass);
  
       let changedata= await userdb.updateOne(
      {
        Email:req.session.passEmail
    },{ 
      $set:{
        Password:pass,
        Confirm:ndPass
      }
    }
    ) 
      console.log(changedata);
      })
    })
    console.log("dfsgfgsfdgsdf");
    console.log(pass);
    
    res.redirect('/login')
  
  
    
  
  }else{
     req.flash("loginsms","paswerd is not match")
     res.redirect('/postnewPass')
  
  
  
  }
  }catch{

  }


}

const getpostnewpass=(req,res)=>{
  try{
    res.render('user/ubdatePasswordPage',{
      loginsms:req.flash("loginsms")

    })

  }catch{

  }

}

module.exports = {
  getHomePage,
  getLogin,
  getSignup,
  postSignupData,
  postUserLogin,
  postOtp,
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
  newPassword,
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
  getpostnewpass,
  postreview,
  serchhome,
  shopsearch,
  resentotp,
  otp,
  forgetPasswerd,
  forgetPasswordPost,
  postotpverifypass
};
