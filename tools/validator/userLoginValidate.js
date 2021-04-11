const validator = require("./validator");
const { check } = require("express-validator");

class userLoginValidate extends validator {
  handle() {
    return [
      check("username")
        .isLength({ min: 3, max: 30 })
        .withMessage("نام کاربری معتبر نمی باشد."),
      check("password")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
        .withMessage("رمز عبور معتبر نمی باشد."),
    ];
  }
}

module.exports = new userLoginValidate();
