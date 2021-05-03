const validator = require("./validator");
const { check } = require("express-validator");

class userEditValidate extends validator {
  handle() {
    return [
      check("firstName")
        .isLength({ min: 3, max: 30 })
        .withMessage("نام نباید کمتر از 3 و بیشتر از 30 حرف باشد."),
      check("lastName")
        .isLength({ min: 3, max: 30 })
        .withMessage("نام خانوادگی نباید کمتر از 3 و بیشتر از 30 حرف باشد."),
      check("mobileNumber")
        .matches(/^(\+989|00989|09)\d{9}$/)
        .withMessage("شماره موبایل معتبر نمی باشد."),
      check("email").isEmail().withMessage("آدرس ایمیل معتبر نمی باشد."),
      check("gender").not().isEmpty().withMessage("جنسیت خود را انتخاب کنید."),
    ];
  }
}

module.exports = new userEditValidate();
