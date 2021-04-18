const validator = require("./validator");
const { check } = require("express-validator");

class commentValidate extends validator {
  handle() {
    return [
      check("comment")
        .isLength({ min: 3, max: 300 })
        .withMessage(
          "طول متن نظر شما نباید کمتر از 3 و بیشتر از 300 کاراکتر باشد."
        ),
    ];
  }
}

module.exports = new commentValidate();
