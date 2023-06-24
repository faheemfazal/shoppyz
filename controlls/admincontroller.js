const { response, render } = require("../app");
const productDb = require("../models/productmodel");
const userdb = require("../models/usermodel");
const categoryDb = require("../models/categarymodel");
const upload = require("../middlewares/multerimg");
// const mongoose =
// const { Object, ObjectId } = require('mongoose/lib/schema/index')
var babel = require("babel-core");
const { ObjectID } = require("bson");
const moment = require("moment");
const { taskQueuesUrl } = require('twilio/lib/jwt/taskrouter/util')
const CoupenDb = require("../models/coupenmodel");
const { Date } = require("mongoose/lib/schema/index");
const twilio = require("twilio");
const orderDb = require("../models/order");
const bannerDb = require("../models/bannermodel");
const { query } = require("express");
const { months, isDate, now } = require("moment");
const { default: mongoose } = require("mongoose");
// var ObjectId = require('mongoose').Types.ObjectId

const getAdminLogPag = (req, res) => {
  try {
    res.render("admin/adminlogin");
  } catch {
    res.redirect("/error");
  }
};

const geterror = (req, res) => {
  res.render("admin/error");
};

const postAdminlogin = (req, res) => {
  try {
    let em = process.env.Email;
    let pass = process.env.Password;
    // console.log(req.body.Password);
    // console.log(pass);
    if (em === req.body.Email && pass === req.body.Password) {
      req.session.adminLoginIn = true;
      res.redirect("/adminhome");
    } else {
      req.session.adminLoginErr = true;
      res.redirect("/admin");
    }
  } catch {
    res.redirect("/error");
  }
};
const userDetails = async (req, res) => {
  try {
    const filter = {};
    const customerData = await userdb.find(filter);

    res.render("admin/userdetail", { customerData });
  } catch {
    res.redirect("/error");
  }
};

// product add
const getuplodpag = async (req, res) => {
  try {
    const takecategory = await categoryDb.find();
    res.render("admin/addproduct", { takecategory });
  } catch {
    res.redirect("/error");
  }
};
const uploadProduct = async (req, res) => {
  try {
    const imageUrl = req.files;

    const img = [];
    req.files.forEach((fl) => {
      img.push(fl.filename);
    });
    console.log("<<<<<<<", img);

    console.log("######");

    const {
      ProductName,
      Category,
      Quantity,
      Colour,
      Price,
      Offer,
      Discription,
      optionsRadios,
    } = req.body;

    if (
      ProductName &&
      Category &&
      Quantity &&
      Colour &&
      Price &&
      Offer &&
      Discription &&
      optionsRadios
    ) {

     if(Offer >= 100){
        console.log("tttttrrfr");

     }else{

   

       console.log(Category);
      const catOffer= await categoryDb.findOne({
        categary:Category
      },
        {_id:0,offer:1}
      )
      console.log(catOffer);
      const offerpersentage=catOffer.offer
      console.log(offerpersentage);
      let categoryOfferPrice= Math.round(Price-(Price*offerpersentage)/100);
      console.log(categoryOfferPrice);
      let productOffer=Math.round(Price-(Price*Offer)/100)
      console.log(productOffer);
      
      let maxOffer;
      if(productOffer<categoryOfferPrice){
        maxOffer=categoryOfferPrice
      }else{
        maxOffer=productOffer
      }

      console.log(ProductName," ",Category," ",Quantity," ",Colour," ",Price,"",maxOffer," ",Discription," ",img," ",Offer," ",Offer);

      // await Object.assign(req.body, {
      //   imageUrl: img,
      //   updatedAt: moment().format("MM/DD/YYYY"),
      // });
      const newproduct = await new productDb({
        ProductName:ProductName,
        Category:Category,
        Quantity:Quantity,
        Colour:Colour,
        Price:Price,
        Offer:maxOffer,
        Discription:Discription,
        imageUrl:img,
        optionsRadios:optionsRadios,
        discountpersentage:Offer
      });
      newproduct
        .save()
        .then((result) => {
          console.log(result);
          res.redirect("/viewProductAdmin");
        })
        .catch((err) => {
          console.log(err);
        });
      }
    } else {
      res.redirect("/uploadproduct");
    }
  } catch {
    res.redirect("/error");
  }
};
const editUplodeProduct = async (req, res) => {
  try {
    const editId = req.params.id;
    let takecategory = await categoryDb.find();
    await productDb
      .find({ _id: editId })
      .then((takeProduct) => {
        res.render("admin/editadminproduct", {
          takecategory,
          takeProduct,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch {
    res.redirect("/error");
  }
};

const viewProduct = async (req, res) => {
  try {
    let producData = await productDb.find().sort({ createdAt: -1 });
    console.log(producData);
    console.log(producData[0].Category);
    let prodCategory=producData[0].Category;
 console.log("ddddddddd");
    const categorydata = {} =await categoryDb.find()
    console.log(categorydata);
    console.log(categorydata.offer);
    res.render("admin/viewproduct", { producData ,categorydata });
   
  } catch {
    res.redirect("/error");
  }
};
const getDashBoard = (req, res) => {
  try {
    res.redirect("/adminhome");
  } catch {
    res.redirect("/error");
  }
};
const gethome = async (req, res) => {
  try {
    let order = await orderDb.find();
    let orderLength = order.length;
    let user = await userdb.find();
    let userLength = user.length;
    const total = await orderDb.aggregate([
      {
        $group: {
          _id: order._id,
          total: { $sum: "$totalAll" },
        },
      },
    ]);
    const totalAmount = total[0].total;
    console.log(total);
    console.log(totalAmount);

    const pending = await orderDb.aggregate([
      {
        $match: {
          paymentStatuse: "payment pending",
        },
      },
      {
        $count: "count",
      },
    ]);

    console.log(pending);
    let pendindCount;
    if (pending.length != 0) {
      pendindCount = pending[0].count;
    }
    console.log(pendindCount);

    res.render("admin/adminhome", {
      orderLength,
      userLength,
      totalAmount,
      pendindCount,
      order,
      dashBoard: true,
    });
  } catch {
    res.redirect("/error");
  }
};

const banuserdata = async (req, res) => {
  try {
    const userId = req.params.id;
    let data = await userdb.findByIdAndUpdate(userId, { block: false });
    if (data) {
      res.redirect("/userdetail");
    } else {
      res.redirect("/adminhome");
    }
  } catch {
    res.redirect("/error");
  }
};

const postEditproduct = async (req, res) => {
  try {
    const data = req.body;
    const productId = req.params.id;
    console.log(req.body);
    console.log(req.body.Offer);
    const newOffer=parseInt(req.body.Offer)
    console.log(req.files.length);
    const product= await productDb.findOne({_id:productId})
console.log(product);

    const catOffer= await categoryDb.findOne({
      categary:req.body.Category
    },
      {_id:0,offer:1}
    )
    console.log(catOffer);
    console.log(newOffer);

    const offerpersentage=catOffer.offer
    console.log(offerpersentage);
    let categoryOfferPrice= Math.round((product.Price*offerpersentage)/100);
    console.log(categoryOfferPrice);
    console.log(req.body.Price);
    console.log(product.Price)
    console.log(newOffer);
    let productOffer=Math.round((product.Price*newOffer)/100)
    console.log(productOffer);
    
    let maxOffer;
    if(productOffer > categoryOfferPrice){
      maxOffer=productOffer
    }else{
      maxOffer=categoryOfferPrice
    }
    console.log(maxOffer);

    const offer=product.Price-maxOffer

    if (req.files.length === 0) {
      console.log("fgfdhfg");
      console.log(data);
       await Object.assign(data,{Offer:offer,discountpersentage:newOffer});

      await productDb.findByIdAndUpdate(productId, { $set: data });

      res.redirect("/viewProductAdmin"); 
    } else {
      var img = [];

      req.files.forEach((el) => {
        img.push(el.filename);
      });

      console.log(img);

      Object.assign(data, { imageUrl: img,Offer:maxOffer });
      await productDb.findByIdAndUpdate(productId, { $set: data });
      res.redirect("/viewProductAdmin");
    }
  } catch(e) {
    console.log(e);

    res.redirect("/error");
  }
};

const deleteproduct = async (req, res) => {
  try {
    const deleteId = req.params.id;
    await productDb.find({ _id: deleteId }).remove();
    res.redirect("/viewProductAdmin");
  } catch {
    res.redirect("/error");
  }
};

// categary

const getCategarylist = async (req, res) => {
  try {
    const allCategory = await categoryDb.find().sort({ createdAt: -1 });
    res.render("admin/categary", { allCategory });
  } catch {
    res.redirect("/error");
  }
};

const addCategary = (req, res) => {
  try {
    res.render("admin/categaryform",{
      catAddErr:req.flash("catAddErr")
    });
  } catch {
    res.redirect("/error");
  }
}

const postUplodCategary = async (req, res) => {
  try {
    let catAddErr;
    let imageUrl = req.files;
    let reqCategory = req.body.category; 
    let offer=req.body.offer
    console.log(imageUrl);

    if (imageUrl && reqCategory) {

      let regExp=new RegExp(reqCategory, "i")
       console.log(regExp)
       console.log(reqCategory)
       const dbCategory= await categoryDb.findOne({categary:{$regex: regExp}})
        console.log(dbCategory)
        if(dbCategory){
          req.flash("catAddErr", "Category already exists");
          console.log("allready exist");
          res.redirect("/addCategary");
        
        }else{
   
          const newCategory = await new categoryDb({
            categary:reqCategory,
            imageUrl:imageUrl,
            offer:offer
          });
          await newCategory
            .save()
            .then((result) => {
              console.log(result);
              res.redirect("/categaryList");
            })
            .catch((err) => {
              console.log("make err");
            });
         
        }

  
    }else{
      req.flash("catAddErr", "Fill full coloms");
      res.redirect("/addCategary");
    }
  } catch {
    res.redirect("/error");
  }
};

const categoryremove = async (req, res) => {
  try {
    let deleteId = req.params.id;
    const categoryData = await categoryDb.find({ _id: deleteId }).remove();
    res.redirect("/categaryList");
  } catch {
    res.redirect("/error");
  }
};

const categoryEdit = async (req, res) => {
  try {
    const editId = req.params.id;
    console.log(editId);
    categoryDb
      .find({ _id: editId })
      .then((editDetails) => {
        console.log(editDetails);

        res.render("admin/editcategory", {
          editDetails,
          editId,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch {
    res.redirect("/error");
  }
};

const editedCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const imgUrl = req.files;
    const category = req.body.category;

    if (imgUrl && category) {
      if (req.files.length === 0) {
        Object.assign(req.body, { categary: req.body.category });
        await categoryDb.findByIdAndUpdate(
          categoryId,
          { $set: req.body },
          {
            upsert: true,
            new: true,
            runValidators: true,
          }
        );
        res.redirect("/categaryList");
      } else {
        Object.assign(req.body, {
          categary: req.body.category,
          imageUrl: imgUrl,
          createdAt: moment().format("MM/DD/YYYY"),
        });
        const newdata = await categoryDb.findByIdAndUpdate(
          categoryId,
          { $set: req.body },
          {
            upsert: true,
            new: true,
            runValidators: true,
          }
        );
        console.log(newdata);
        res.redirect("/categaryList");
      }
    }
    //  else if(imgUrl !== 0){
    //     console.log("ffffffff")
    //     Object.assign(req.body,{imageUrl :imgUrl})
    //          await categoryDb.findByIdAndUpdate(categoryId,{$set:req.body},{
    //             upsert:true,
    //             new:true,
    //             runValidators:true
    //          })
    //          res.redirect('/categaryList')
    //  }
    else {
      res.redirect(`/editCategory/${categoryId}`);
    }
  } catch {
    res.redirect("/error");
  }
};

const unbanUserata = async (req, res) => {
  try {
    console.log("..........." + req.params.id);
    const bandata = req.params.id;
    let data = await userdb.findByIdAndUpdate(bandata, { block: true });
    if (data) {
      res.redirect("/userdetail");
    } else {
      res.redirect("/adminhome");
    }
  } catch {
    res.redirect("/error");
  }
};

// coupen

const getcoupenpage = (req, res) => {
  try {
    res.render("admin/formcoupen", { CoupenErr: req.flash("CoupenErr") });
  } catch {
    res.redirect("/error");
  }
};
const postCoupen = async (req, res) => {
  try {
    const {
      code,
      percentage,
      amount,
      minCartAmount,
      expireAfter,
      usageLimit,
      maxCartAmount,
    } = req.body;

    if (
      code &&
      percentage &&
      amount &&
      expireAfter &&
      usageLimit &&
      minCartAmount &&
      maxCartAmount
    ) {
      let rejexp = new RegExp(code, "i");

      const copen = await CoupenDb.findOne({ code: { $regex: rejexp } });
      if (copen) {
        req.flash("CoupenErr", "Alredy Use The Same CoupenCode");
        res.redirect("/addCoupen");
      } else {
        console.log("dweedsdsdssdsssssssss");
        const coupen = {
          code,
          percentage,
          amount,
          expireAfter,
          usageLimit,
          minCartAmount,
          maxCartAmount,
        };
        await CoupenDb.create(coupen).catch((err) => {
          console.log(err);
        });

        res.redirect("/coupen");
      }
    } else {
      console.log("fill full column");
      req.flash("CoupenErr", "Fill Full Colums");
      res.redirect("/addCoupen");
    }
    console.log(code + "  " + minCartAmount);
  } catch {
    res.redirect("/error");
  }
};

// getCoupen

const getCoupen = async (req, res) => {
  try {
    const coupens = await CoupenDb.find().sort({ createdAt: -1 });
    res.render("admin/coupen", {
      coupens,
      coupenview: true,
    });
  } catch {
    res.redirect("/error");
  }
};

const deletecoupen = async (req, res) => {
  try {
    const coupenId = req.query.coupenId;
    await CoupenDb.findByIdAndRemove(coupenId).then((ans) => {
      console.log(ans);
      res.json("success");
    });
  } catch {
    res.redirect("/error");
  }
};

const activeCouppen = async (req, res) => {
  try {
    const coupenId = req.query.id;
    await CoupenDb.updateOne(
      { _id: coupenId },
      {
        $set: {
          status: "ACTIVE",
        },
      }
    ).then((result) => {
      res.redirect("/coupen");
    });
  } catch {
    res.redirect("/error");
  }
};

const blockCoupen = async (req, res) => {
  try {
    console.log(req.query);
    const coupenId = req.query.id;
    await CoupenDb.findByIdAndUpdate(
      { _id: coupenId },
      {
        $set: {
          status: "BLOCK",
        },
      }
    ).then((result) => {
      res.redirect("/coupen");
    });
  } catch {
    res.redirect("/error");
  }
};

const orderstatus = async (req, res) => {
  console.log(req.query);
  const orderId = req.query.oderId;
  const status = req.query.status;
  console.log(orderId);
  console.log(status);
  if (status == "Delivered") {
    const update = await orderDb
      .updateOne(
        {
          _id: orderId,
        },
        {
          $set: {
            OrderStatuse: status,
            paymentStatuse: "payment complited",
            track: status,
          },
        }
      )
      .then((result) => {
        console.log(result);
        res.json("success");
      });
  } else {
    const update = await orderDb
      .updateOne(
        {
          _id: req.query.oderId,
        },
        {
          $set: {
            track: status,
            OrderStatuse: status,
          },
        }
      )
      .then((result) => {
        console.log(result);
        res.json("success");
      });
  }
};

const getOrderData = async (req, res) => {
  try {
    const Orders = await orderDb.find().sort({ createdAt: -1 });

    res.render("admin/orders", {
      Orders,
      product: Orders[0].products,
    });
  } catch {
    res.redirect("/error");
  }
};

const getOrderDetails = async (req, res) => {
  try {
    console.log(req.params.id);
    const order = await orderDb
      .findOne({ _id: req.params.id })
      .populate("products.ProductDetails");
    const Orders = await orderDb
      .find({ _id: req.params.id })
      .sort({ createdAt: -1 });
    console.log(order.products);
    console.log(order);

    res.render("admin/orderdetails", {
      Orders,
      product: order.products,
    });
  } catch {
    res.redirect("/error");
  }
};

const viewBanner = async (req, res) => {
  try {
    const banners = await bannerDb.find().sort({ createdAt: -1 });
    console.log(banners);

    res.render("admin/viewbanner", {
      banners,
    });
  } catch {
    res.redirect("/error");
  }
};

const AddBanner = (req, res) => {
  try {
    res.render("admin/addbannerform", {
      bannerAddErr: req.flash("bannerAddErr"),
    });
  } catch {
    res.redirect("/error");
  }
};
const postBanner = async (req, res) => {
  try {
    const { Heading, mainHeading, Discription, Offer, Url } = req.body;
    const imageUrl = req.files;
    console.log(Heading + "  " + Offer + "  " + Url);
    if (Heading && mainHeading && Discription && Offer && Url) {
      Object.assign(req.body, { imageUrl: imageUrl });
      const newBanner = await new bannerDb(req.body);
      await newBanner.save().then((result) => {
        console.log(result);
        res.redirect("/Banner"); 
      });
    } else {
      req.flash("bannerAddErr", "Fill Full Column");
      res.redirect("/addBanner");
    }
  } catch {
    res.redirect("/error");
  }
};
const getBannerEdit = async (req, res) => {
  try {
    console.log(req.params.id);
    const banner = await bannerDb.findOne({ _id: req.params.id });
    console.log(banner);
    res.render("admin/bannereditform", { banner });
  } catch {
    res.redirect("/error");
  }
};

const postEditedBanner = async (req, res) => {
  try {
    res.redirect("/Banner");
  } catch {
    res.redirect("/error");
  }
};

const DeleteBanner = async (req, res) => {
  try {
    console.log(req.query);
    const bannerId = req.query.id;
    await bannerDb.findByIdAndDelete(bannerId).then((answer) => {
      console.log(answer);
      res.json("success");
    });

    console.log("jdnfssjdj");
  } catch {
    res.redirect("/error");
  }
};

const salesReport = async (req, res) => {
  try {
    const salesReport = await orderDb.aggregate([
      {
        $match: {
          OrderStatuse: { $eq: "Delivered" },
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
            day: {
              $dayOfMonth: "$createdAt",
            },
            year: {
              $year: "$createdAt",
            },
          },
          TotalPrice: { $sum: "$totalAll" },
          products: { $sum: { $size: "$products" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { createdAt: 1 },
      },
    ]);
    console.log(salesReport);

    res.render("admin/salesreport", { salesReport });
  } catch {
    res.redirect("/error");
  }
};

const monthReport = async (req, res) => {
  try {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const salesRepost = await orderDb.aggregate([
      { $match: { OrderStatuse: { $eq: "Delivered" } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          TotalPrice: { $sum: "$totalAll" },
          products: { $sum: { $size: "$products" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { date: -1 },
      },
    ]);
    console.log(salesRepost);
    const newSalesreport = salesRepost.map((el) => {
      let newEl = { ...el };
      newEl._id.month = months[newEl._id.month - 1];
      return newEl;
    });
    console.log(newSalesreport);
    res.render("admin/monthreport", {
      salesRepost: newSalesreport,
    });
  } catch {
    res.redirect("/error");
  }
};

const yearRreport = async (req, res) => {
  try {
    const salesReport = await orderDb.aggregate([
      { $match: { OrderStatuse: { $eq: "Delivered" } } },

      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
          },
          TotalPrice: { $sum: "$totalAll" },
          products: { $sum: { $size: "$products" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { date: -1 },
      },
    ]);

    console.log(salesReport);
    console.log("dfsdfsdf");

    res.render("admin/yearreport", { salesReport });
  } catch {
    res.redirect("/error");
  }
};

const GetChartDetails = async (req, res) => {
 try{
  console.log("edsfadfsd");
  console.log(req.query.value);
  const value = req.query.value;
  const date = moment().format("DD/MM/YYYY");
  const month = moment().month();
  const year = moment().year();
  console.log(date);
  console.log(month);
  console.log(year);

  let sales = [];
  if (value == 365) {
    var currentYear = moment([year]).toDate();
    console.log(currentYear);
    let salesByYear = await orderDb.aggregate([
      {
        $match: {
          createdAt: { $gte: currentYear },
          OrderStatuse: { $eq: "Delivered" },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%m", date: "$createdAt" },
          },
          TotalPrice: { $sum: "$totalAll" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    console.log(salesByYear);
    for (let i = 1; i <= 12; i++) {
      console.log(i);
      let result = true;
      for (let k = 0; k < salesByYear.length; k++) {
        console.log("ii");
        result = false;
        if (salesByYear[k]._id == i) {
          sales.push(salesByYear[k]);
          break;
        } else {
          result = true;
        }
      }
      if (result) sales.push({ _id: i, TotalPrice: 0, count: 0 });
    }
    console.log(sales);
    let salesData = [];
    for (let i = 0; i < sales.length; i++) {
      salesData.push(sales[i].TotalPrice);
    }
    res.json({ status: true, sales: salesData });
  } else if (value == 30) { 
    console.log("fff" + value);
    // let currentWeek=moment()
    // let weekfirstday=currentWeek.clone().startOf('isoweek');
    // console.log(weekfirstday);
    let firstDay = moment().startOf("month").toDate();
    
    let nextweek = moment(firstDay).weekday(7).toDate();
    console.log(firstDay);
    console.log(nextweek);
    for (let i = 1; i <= 5; i++) {
      let abc = {};
      let salesByMonth = await orderDb.aggregate([
        {
          $match: {
            createdAt: { $gte: firstDay, $lt: nextweek },
            OrderStatuse: { $eq: "Delivered" },
          },
        },
        {
          $group: {
            _id: moment(firstDay).format("DD-MM-YYYY"),
            TotalPrice: { $sum: "$totalAll" },
            count: { $sum: 1 },
          },
        },
      ]);
      if (salesByMonth.length) {
        sales.push(salesByMonth[0]);
      } else {
        (abc._id = moment(firstDay).format("DD-MM-YYYY")), (abc.TotalPrice = 0);
        abc.count = 0;
        sales.push(abc);
      }
      firstDay = nextweek;
      if (i == 4) {
      } else {
        nextweek = moment(firstDay)
          .weekday(i * 7)
          .toDate();
      }
      console.log(nextweek);
      console.log(salesByMonth);
      console.log(sales);
    }
    let salesData = [];
    for (let i = 0; i < sales.length; i++) {
      salesData.push(sales[i].TotalPrice);
    }
    console.log(salesData);
    res.json({ status: true, sales: salesData });
  } else if (value == 7) {
    console.log("kkk");
    console.log("dddddd");
    let currentWeek=moment()
    let weekfirstday=currentWeek.clone().startOf('isoweek').toDate()
    
    let firstDay = currentWeek.clone().startOf('isoweek').toDate()
    console.log(weekfirstday);
    let lastDay = moment(firstDay).endOf("day").toDate();
    console.log(firstDay);
    console.log("dddddd");
    console.log(lastDay);
    for (let i = 1; i <= 7; i++) {
      let abc = {};
      let salesByWeek = await orderDb.aggregate([
        {
          $match: {
            createdAt: { $gte: firstDay, $lt: lastDay },
            OrderStatuse: { $eq: "Delivered" },
          },
        },
        {
          $group: {
            _id:  moment(lastDay).format("DD-MM-YYYY"),
            TotalPrice: { $sum: "$totalAll" },
            count: { $sum: 1 },
          },
        },
      ]);
      if(salesByWeek.length){
        sales.push(salesByWeek[0]);
      }else{
        abc._id =  moment(lastDay).format("DD-MM-YYYY"), (abc.TotalPrice = 0);
        abc.count = 0;
        sales.push(abc);

      }
      firstDay=lastDay;
      lastDay=moment(firstDay).add(1,'days').toDate();
      // moment(firstDay)
      // .weekday(i * 7)
      // .toDate();
      console.log(firstDay);
      console.log("dddddd");
      console.log(lastDay);
      console.log(salesByWeek);
    }
    let salesData=[]
    for (let i = 0; i < sales.length; i++) {
      salesData.push(sales[i].TotalPrice);
      
    }
    res.json({ status: true, sales: salesData });

    // console.log(firstDay);
    // console.log("dddddd");
    // console.log(lastDay);
    // console.log(sales);
    // console.log("....");
    // console.log(salesData);
  }
  console.log(sales);
 }catch{
  res.redirect("/error");
 }
};

const getPieChartDetails = async(req,res)=>{
  try{
    const cancel = await orderDb.find({ OrderStatuse: "Order Canceled" }).count()
    const deliverd = await orderDb.find({ OrderStatuse: "Delivered" }).count()
    const confirm = await orderDb.find({ OrderStatuse: "order Confirmed" }).count()
    let data =[];
    data.push(cancel)
    data.push(confirm)
    
    data.push(deliverd)
    console.log(data);
    res.json({ data});
  }catch{
    res.redirect("/error");
  }

}

const aprpoveReturn=async(req,res)=>{
  try{
    console.log(req.body);
    console.log("rrrrrr");
    console.log(req.query);
    console.log(req.query.userdata);
    console.log(req.query.total);
    let userid=req.query.userdata
    console.log(typeof(req.body.userdata));
    const uu= await userdb.find({_id:req.body.userdata})
    const total= parseInt(req.query.total)

    console.log(uu,'llllllllllllllllllllllllllllllllllllllllll');
    const orderid=req.query.oderId
    const updateWallet = await userdb.findByIdAndUpdate(
     {
       _id:req.body.userdata ,
     },
     {
       $inc: {
        wallet: total,
       },
     }
   );
   console.log(updateWallet);

   const cancelOrder = await orderDb.findByIdAndUpdate(orderid, {
     OrderStatuse: "Returned Success",
     track: "Returned Success",
   });
   console.log(updateWallet);
   console.log(cancelOrder);
   res.json("success")
 
  }catch{
    res.redirect("/error");
  }
 

}

const adminlogout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch {
    res.redirect("/error");
  }
};

module.exports = {
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
  aprpoveReturn
};
