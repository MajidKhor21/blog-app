const validator = require("./validator");
const { check } = require("express-validator");

class commentValidate extends validator {
  handle() {
    return [
      check("comment")
        .isLength({ min: 3, max: 300 })
        .withMessage("نظر شما نباید کمتر از 3 و بیشتر از 300 حرف باشد."),
    ];
  }
}

module.exports = new commentValidate();
