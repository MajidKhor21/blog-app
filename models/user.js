const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 50,
    match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female"],
  },
  mobileNumber: {
    type: String,
    unique: true,
    required: true,
    match: /^\d{11}$/,
  },
  lastUpdate: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ["admin", "blogger"],
    default: "blogger",
  },
});

UserSchema.methods.toJSON = function () {
  let user = this.toObject();
  delete user._id;
  delete user.__v;
  delete user.password;
  return user;
};

UserSchema.pre("save", function (next) {
  const user = this;
  if (this.isNew || this.isModified("password")) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        return next();
      });
    });
  } else {
    return next();
  }
});

module.exports = mongoose.model("User", UserSchema);
