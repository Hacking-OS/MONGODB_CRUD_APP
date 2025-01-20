const express = require("express");
const router = express.Router();
const User = require("../modals/user");
const multer = require("multer");
const fs = require("fs");
const { extname } = require("path");
const faker = require('faker');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + extname(file.originalname));
    }
});

var upload = multer({
    storage: storage,
}).single("image");

router.post("/add", upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });

    const generateUser = () => ({
        name: faker.name.findName(),
        email: faker.internet.email(),
        phone: faker.phone.phoneNumber(),
        image: faker.image.avatar(),
      });

    const users = Array.from({ length: 500 }, generateUser);
    user.save((err) => {

        (err) ? res.json({
            message: err.message,
            type: "danger"
        }): req.session.message = {
            type: "success",
            message: "user added successfully!"
        };
        // res.redirect("/");

    });

         // Now, insert the 500 generated fake users
        //  User.insertMany(users)
        //  .then((result) => {
        //      // If both user and fake users were added successfully
        //      req.session.message = {
        //          type: "success",
        //          message: `${result.length + 1} users added successfully!`
        //      };
        //      res.redirect("/");
        //  })
        //  .catch((err) => {
        //      // Handle any error with the fake users insertion
        //      res.json({
        //          message: err.message,
        //          type: "danger"
        //      });
        //  });
});

// router.get("/users",(req,res)=>{
//     res.send("All users");
// });
router.get("/", (req, res) => {
    // res.send("HomePage");
    User.find().exec((err, users) => {
        if (err) {
            res.json({
                message: err.message
            });
        } else {
            res.render("index", {
                title: "Home Page",
                users: users,
            });
        }
    });
});
router.get("/add", (req, res) => {
    // res.send("HomePage");
    res.render("adduser", {
        title: "Add User"
    });
});



router.get("/edit/:id", (req, res) => {
    let id = req.params.id;
    User.findById(id, (err, users) => {
        if (err) {
            res.redirect("/");
        } else {
            if (users == null) {
                res.redirect("/");
            } else {
                res.render("edituser", {
                    title: "Edit User",
                    users: users,
                });
            }
        }
    });
});


router.post("/edit/:id", upload, (req, res) => {
    let id = req.params.id;
    let newImage = "";
    if (req.file) {
        newImage = req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.old_image);
        } catch (err) {
            console.log("error:" + err);
        }
    } else {
        newImage = req.body.old_image;
    }
    User.findByIdAndUpdate(id,{
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: newImage,
    },(err,result)=>{
        (err) ? res.json({
            message: err.message,
            type: "danger"
        }): req.session.message = {
            type: "success",
            message: "User Updated successfully!"
        };
        res.redirect("/");
    });
});

router.get("/delete/:id", (req, res) => {
    let id = req.params.id;
    if(!id) return res.redirect("/");
    User.findByIdAndRemove(id, (err, result) => {
        if(err) res.json({ message: err.message, type: "danger" }); 
        if(result.image!=""){
            try {
                if (fs.existsSync("./uploads/" + result.image)) {
                    fs.unlinkSync("./uploads/" + result.image);  
                }
            }
            catch(err){
             res.json({ message: err?.message, type: "danger" });
            };
        }
        req.session.message = { type: "success", message: "User Deleted Successfully!" }; 
        res.redirect("/");
    });
});
    

// user.save((err) => {
//     (err) ? res.json({
//         message: err.message,
//         type: "danger"
//     }): req.session.message = {
//         type: "success",
//         message: "user added successfully!"
//     };
//     res.redirect("/");
// });
// router.get("/delete",(req,res)=>{
//     // res.send("HomePage");
//     res.render("deleteuser",{title:"Delete User"});
// });

module.exports = router;