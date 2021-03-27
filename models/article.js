const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  brief: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 100,
  },
  describe: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 3000,
  },
  picture: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdate: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

module.exports = mongoose.model("Article", ArticleSchema);
