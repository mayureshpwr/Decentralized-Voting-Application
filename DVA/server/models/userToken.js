const mongoose = require("mongoose");

const userTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  active: {
    type: Number,
    default: 1,
  },
  expiresIn: {
    type: Number,
  },
});

const UserToken = mongoose.model("UserToken", userTokenSchema);

module.exports = UserToken;
