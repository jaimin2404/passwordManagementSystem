const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://prajapatijaimin2404:L7Ot1RFNN6JVCygy@chatapp.cw65ca9.mongodb.net/passwordManagement",
  {
    useNewUrlParser: true,
  }
);
var conn = mongoose.connection;
var passwordSchema = new mongoose.Schema({
  passwordCategory: {
    type: String,
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  passwordDetail: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});
var passwordModel = mongoose.model("password", passwordSchema);
module.exports = passwordModel;
