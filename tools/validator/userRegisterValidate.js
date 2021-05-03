const validator = require("./validator");
const { check } = require("express-validator");

class userRegisterValidate extends validator {
  handle() {
    return [
      check("firstName")
        .isLength({ min: 3, max: 30 })
        .withMessage("نام نباید کمتر از 3 و بیشتر از 30 حرف باشد."),
      check("lastName")
        .isLength({ min: 3, max: 30 })
        .withMessage("نام خانوادگی نباید کمتر از 3 و بیشتر از 30 حرف باشد."),
      check("email")
        .isEmail()
        .withMessage("آدرس ایمیل وارد شده معتبر نمی باشد."),
      check("username")
        .isLength({ min: 3, max: 30 })
        .withMessage("نام کاربری معتبر نمی باشد."),
      check("password")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
        .withMessage(
          "رمز عبور باید شامل 6 کاراکتر و یک حرف بزرگ و یک حرف کوچک باشد."
        ),
      check("mobileNumber")
        .matches(/^(\+989|00989|09)\d{9}$/)
        .withMessage("شماره موبایل وارد شده معتبر نمی باشد."),
      check("gender").not().isEmpty().withMessage("جنسیت خود را وارد کنید."),
    ];
  }
}

module.exports = new userRegisterValidate();
