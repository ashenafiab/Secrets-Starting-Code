require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = new mongoose.model("User", userSchema);


app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username })
        .then(function (foundUser) {
            if (foundUser) {
                // Load hash from your password DB.
                bcrypt.compare(password, foundUser.password)
                    .then(function (result) {
                        if (result === true) {
                            res.render("secrets");
                        }
                        else {
                            res.send("Incorrect password");
                        }
                    });
            }
            else {
                res.send("User not found");
            }
        }
        )
        .catch(function (err) {
            res.send(err);
        });
});


app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {

    bcrypt.hash(req.body.password, saltRounds)
        .then(function (hash) {

            const newUser = new User({
                email: req.body.username,
                password: hash
            });

            newUser.save()
                .then(function () {
                    res.render("secrets");
                })
                .catch(function (err) {
                    res.send(err);
                });
        })

        .catch(function (err) {
            console.log(err);
        });

});



app.listen(3000, function () {
    console.log("Server started on port 3000");
});