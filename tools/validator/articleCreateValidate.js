const validator = require("./validator");
const { check } = require("express-validator");

class articleCreateValidate extends validator {
  handle() {
    return [
      check("title")
        .isLength({ min: 3, max: 50 })
        .withMessage("نام مقاله نباید کمتر از 3 و بیشتر از 50 کاراکتر باشد."),
      check("brief")
        .isLength({ min: 3, max: 100 })
        .withMessage(
          "خلاصه مقاله نباید کمتر از 3 و بیشتر از 100 کاراکتر باشد."
        ),
      check("picture")
        .not()
        .isEmpty()
        .withMessage("تصویری برای مقاله انتخاب نشده است."),
      check("describe")
        .isLength({ min: 10, max: 3000 })
        .withMessage(
          "متن مقاله نباید کمتر از 10 و بیشتر از 3000 کاراکتر باشد."
        ),
    ];
  }
}

module.exports = new articleCreateValidate();
