//imports 
require('dotenv').config();
const express = require("express");
// const mongodb = require("mongodb").MongoClient;
const session = require("express-session");
const mongoose  = require('mongoose');
const os  = require('node:os');
const ip='192.168.0.38';
// const ip=os.networkInterfaces().Ethernet[1].address;
const app = express();
const port = process.env.PORT||5000;

// database Connection
    // mongodb.connect(process.env.DB_URI, function (err, db) {
    //     if (err) throw err;
    // process.env.DB_URI
    mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    const db= mongoose.connection;
    // console.log(db);return;
    db.on("error",(error)=>{console.log(error)});
    db.once("open", ()=>{console.log("Connected to Data Base")});

        app.use(express.urlencoded({extended:false}));
        app.use(express.json());
        app.use(session({
            secret:"key",
            saveUninitialized:true,
            resave:false,
        }));

        app.use((req,res,next)=>{
            res.locals.message= req.session.message;
            delete req.session.message;
            next();
        });
        app.use(express.static("uploads"));

        app.set("view engine","ejs");
     

// console.log(process.env);
app.use("",require("./routes/route"))
// app.get("/",(req,res)=>{
// res.send("Hello world");
// });


app.listen(port,ip,()=>{
    console.log(`Example app listening at http://${ip}:${port}`);
});