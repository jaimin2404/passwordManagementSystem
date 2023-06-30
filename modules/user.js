const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://prajapatijaimin2404:L7Ot1RFNN6JVCygy@chatapp.cw65ca9.mongodb.net/passwordManagement",
  {
    useNewUrlParser: true,
  }
);
var conn = mongoose.connection;
var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  email: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});
var userModel = mongoose.model("users", userSchema);
module.exports = userModel;
