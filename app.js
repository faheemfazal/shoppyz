const express =require('express')
const http =require('http')
const mongoose=require('mongoose')
const path=require('path')
var logger=require('morgan')
const cookieparser=require('cookie-parser')
const session=require('express-session')
var falsh=require('connect-flash')
const nocache = require("nocache")
const twilio=require('twilio')

// const Product= require('./models/cartmodel')
// const Cart=require('./models/productModel')

var dotenv =require('dotenv')
const { MongoClient } = require('mongodb');
var app = express()

// dotenv.config()
app.use(nocache());
var adminRouter = require("./router/admin");
var usersRouter = require("./router/user");






app.set("views",path.join(__dirname,"views"))
app.set('view engine','ejs') 


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.urlencoded({extended:false}));
app.use(cookieparser())
app.use(express.static(path.join(__dirname,"public")));
app.use(falsh())


app.use(session({
    secret:"sessionkey",
    resave:false,
    saveUninitialized:true,
    cookie:{maxAge:60000000},
   
}))

app.use("/", adminRouter); 
app.use("/", usersRouter);


// app.use('/',require('./router/user'))
// app.use('/',require('./router/admin'))


module.exports=app





