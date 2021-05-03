const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResetPasswordSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/^[a-zA-Z0-9.]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,4}/],
  },
  token: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("reset-password", ResetPasswordSchema);
