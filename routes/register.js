const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/", (req, res, next) => {
  res.render("register");
});

router.post("/", (req, res, next) => {
  console.log(req.body);
});

module.exports = router;
