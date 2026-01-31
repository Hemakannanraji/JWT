// //Import the express framework to create server and API
// const express = require("express");
// //Import Mongoose to connect the node js to MongoDB
// const mongoose = require("mongoose");
// //Import bcryptjs to encrpt the password(hash)
// const bcrypt = require("bcryptjs");
// //Import jsonwedtoken = JWT  to create token
// const jwt = require("jsonwebtoken");
// //Import CORS to accept the frontend request
// const cors = require("cors");

// //Create Express Server - Application
// const app = express();
// //Allow the server to read the JSON request
// app.use(express.json());
// //Allow require from client
// app.use(cors());

// //MongoDB connection
// mongoose.connect("mongodb://127.0.0.1:27017/authDB")
// .then(() => console.log("MongoDB connected."));

// //Create a model to interact with the collection
// const User= mongoose.model("User",{name: String, email: String, password: String},"user");

// //register API - POST Method
// app.post("/register",async(req,res) => {
//     //Get name,email,password from request body
//     const {name,email,password} =req.body;
//     //Check whether the email is already registerd
//     const existing = await User.findOne({email});
//     if(existing){
//         return res.status(400).json({message:"User already exists"});
//     }
//     //Convert the password into hashed password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     //Save the user in MongoDB
//     await User.create ({
//         name,
//         email,
//         password: hashedPassword
//     });
//     res.json({message:"User added Successfully"});

//     //Compare password and email
//     app.post("/login", async(req,res) =>{
//         const{email,password} = req.body;
//         //Find user Email
//         const user = await User.findOne({email});
//         if(!user){
//             return res.status(400).json({message:"User not found"})
//         }
//         const isMatch = await bcrypt.compare(password,user.password);
//         if(!isMatch){
//             return res.status(400).json({message:"Wrong password"});
//         }

//         const token=jwt.sign(
//             {id:user.__id},
//             "1234",
//             {expiresIn:"1h"}
//         )
//         res.json({token})
//     });


// });

// //Start the server on 4000 PORT
// app.listen(4000,()=>{
//     console.log("Server is running on http://localhost:4000");
// })




const express = require('express');
const mongoose = require('mongoose');

//import bcryptjs to encrypt the password (hash)
const bcrypt = require("bcryptjs");

//import jsonwebtoken - to create JWT tokens
const jwt= require('jsonwebtoken');

const cors=require('cors');

const {OAuth2Client} = require("google-auth-library")

//create express server
const app = express();

//allow server to read the json request
app.use(express.json());

//allow request from client
app.use(cors());

const SECRET= "1234"; //for JWT



const GOOGLE_CLIENT_ID = "196188331776-tdiaeagbqsgloriujomm02876ccoi3pk.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);



mongoose.connect("mongodb://localhost:27017/authDB")
.then(()=> console.log("Connected to MongoDB"));



//create a model to interact with collection 
//parameter (model name, schema, collection)
const User = mongoose.model("User", {name:String,email:String,password:String, googleId:String}, "users");


//Register api - post method
app.post("/register", async (req, res) => { 
    const {name, email, password} = req.body; 

    //check whether the email is already registered
    const existing = await User.findOne({email});
    
    if(existing){
        return res.status(400).json({message: "User already exists"});
    }

    //encrypting the password
    const hashedPassword = await bcrypt.hash(password,10);

    const added_data=await User.create({name, email, password:hashedPassword});
    res.json({message: "User registered successfully", User:added_data});

});

//compare password and email
app.post("/login", async(req,res) => {
    const {email, password} =req.body;
    const user=await User.findOne({email});
    if(!user){
        return res.status(400).json({message: "User not found"});
    }
    //compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(400).json({message: "Wrong Password"});
    }

    const token=jwt.sign(
        {id: user._id},
        "1234",//secret key
        {expiresIn: "1h"}
    )
    res.json({token});
});

//Google login API
app.post("/auth/google", async (req, res) => {
    try{

        const {id_token} = req.body;
        if(!id_token) return res.status(400).json({message:"No Google Token"})
            //verify token
        const ticket = await googleClient.verifyIdToken({
            idToken: id_token,
            audience: GOOGLE_CLIENT_ID
        });
        //extract user info form google token
        const payload = (await ticket).getPayload();
        const name=payload.name;
        const email=payload.email;
        const googleId=payload.sub;
        //check if user exists in DB
        let user = await User.findOne({email})
        if(!user){
            user = await User.create({name, email,password:"" ,googleId});
        }

        //issue JWT token
        const token = jwt.sign({id: user._id}, SECRET, {expiresIn: "1h"});
        res.json({token});
    }
    catch(err){
        res.status(400).json({message:"Google Login Failed"});
    }
});



app.listen(5000, () => {  
    console.log("Server is running on port 5000");
});