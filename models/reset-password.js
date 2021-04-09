const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResetPasswordSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    match: [
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    ],
  },
  token: {
    type: String,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("reset-password", ResetPasswordSchema);
