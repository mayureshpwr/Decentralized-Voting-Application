const UserToken = require("../models/userToken");
const jwt = require("jsonwebtoken");
//List Api's which generates jwt tokens
const issData = ["/login"];
let jwtSecretKey =
  "sahilyadavsahilyadavsahilyadavsahilyadavsahilyadavsahilyadavsa";
const createToken = async (req, res, data) => {
  const domain = req.get("host") || req.get("origin");
  const api = req.originalUrl;
  const iss = domain + api;
  // Define the default response message
  let message = {
    isVerified: false,
    token: "",
    refreshToken: "",
  };
  // Check if the API route is in the allowed list (issData)
  if (issData.indexOf(api) !== -1) {
    try {
      // Generate an access token with a specific expiration time
      const token = jwt.sign({ iss: iss, data: data }, jwtSecretKey, {
        expiresIn: 3600 * 24, // 24 hours in seconds
      });
      // console.log(token, "token token");
      // Insert the access token into the database using Mongoose
      const userToken = new UserToken({
        email: data.email,
        token: token,
        active: 1,
        expiresIn: 3600 * 24, // 24 hours in seconds
      });

      const savedUserToken = await userToken.save();

      message = {
        isVerified: true,
        token: token,
      };
    } catch (error) {
      console.error(error);
    }
  }
  return message;
};



const verifyToken = async (req, res) => {
  try {
    const bearerHeader = req.headers["authorization"];
    if(bearerHeader===undefined){
      return res.status(401).json({
        message:"No token"
      })
    }

    const token = bearerHeader.split(" ")[1];
    const matchToken = await UserToken.findOne({ token });
    // console.log(matchToken, "matchToken");
    if (!matchToken) {
      return {
        message: "Invalid Token",
        isVerified: false,
        data: null,
      };
    }
    // console.log(matchToken.active !== 1, "matchToken.active !== 1");
    if (matchToken.active !== 1) {
      return {
        message: "Token Expired",
        isVerified: false,
        data: null,
      };
    }

    // Verify the token's validity and decode its payload
    const decode = jwt.verify(token, jwtSecretKey);
    // console.log(decode, 'decode');
    return {
      message: "Success",
      isVerified: true,
      data: decode,
      token,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Unauthorized User",
      isVerified: false,
      data: null,
    };
  }
}; 
module.exports = { createToken, verifyToken };
