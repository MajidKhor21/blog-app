const validator = require("./validator");
const { check } = require("express-validator");

class commentValidate extends validator {
  handle() {
    return [
      check("comment").not().isEmpty().withMessage("بدنه نظر خالی می باشد."),
    ];
  }
}

module.exports = new commentValidate();
