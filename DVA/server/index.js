const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors"); // Corrected require statement
const app = express();
const jwt = require("jsonwebtoken");
const jwttoken = require("./services/Auth");
const PORT = process.env.PORT || 5000;
const UserToken = require("./models/userToken");
require("dotenv").config();

mongoose
  .connect(process.env.Mongo_url, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Middleware
app.use(cors(["https://decentralized-voting-application-ten.vercel.app/"]));
app.use(bodyParser.json());
app.use(express.json());

// Define User schema
const User = mongoose.model("user", {
  email: String,
  username: String,
  connectAddress: String,
});
// Routes
app.post("/api/register", async (req, res) => {
  const { email, username, connectAddress } = req.body;
  if (!(email && username && connectAddress)) {
    return res
      .status(400)
      .json({ status: false, message: "All fields are required" });
  }
  try {
    const uniqueUser = await User.findOne({ connectAddress });
    if (uniqueUser) {
      return res
        .status(400)
        .json({ status: false, message: "Wallet address already registered" });
    }
    const user = new User({
      email,
      username,
      connectAddress,
    });
    await user.save();
    return res
      .status(201)
      .json({ message: "User registered successfully", status: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Assuming you have a UserToken model

app.post("/login", async (req, res) => {
  try {
    const connectAddress = req.body.accountAddress;
    // console.log(req.body, "req.body");
    const checkUser = await User.findOne({ connectAddress }); 
    if (!checkUser) {
      return res.status(404).json({
        status: false,
        message: "User Not Found! check your address",
      });
    }

    // Generate JWT token
    const userObject = {
      email: checkUser.email,
      username: checkUser.username,
      walletAddress: checkUser.walletAddress,
    };
    const verification = await jwttoken.createToken(req, res, userObject);
    if (verification.isVerified) {
      res.status(200).json({
        status: true,
        message: "Login successful",
        token: verification.token,
        data: checkUser,
      });
    } else {
      res.status(401).json({ status: false, message: "UnAuthorized user!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

app.post("/voting", async (req, res) => {
  try {
    let verification = await jwttoken.verifyToken(req, res);
    if (!verification.isVerified) {
      return res
        .status(401)
        .json({ status: false, message: verification.message });
    }
    // console.log(verification, "verification");
    return res
      .status(200)
      .json({ status: true, isVerified: verification.isVerified });
  } catch (error) {
    return res.status(500).json({
      message:"Internal server Error"
    })
  }
});

app.post("/logout", async (req, res) => {
  try {
    let verification = await jwttoken.verifyToken(req, res);
    // console.log(verification, "verification");
    if (verification.isVerified) {
      await UserToken.updateOne(
        { token: verification.token },
        { active: 0, new: true }
      );
      return res
        .status(200)
        .json({ status: true, message: "Succesfully logged out!" });
    } else {
      return res
        .status(401)
        .json({ status: false, message: verification.message });
    }
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
