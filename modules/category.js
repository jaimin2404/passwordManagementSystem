const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://prajapatijaimin2404:L7Ot1RFNN6JVCygy@chatapp.cw65ca9.mongodb.net/passwordManagement",
  {
    useNewUrlParser: true,
  }
);
var conn = mongoose.connection;
var categorySchema = new mongoose.Schema({
  categoryname: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});
var categoryModel = mongoose.model("category", categorySchema);
module.exports = categoryModel;
