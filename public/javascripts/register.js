$(document).ready(() => {
  $("#registerBtn").click(() => {
    $("input").each(function () {
      if (!$(this).val()) {
        $(this).addClass("plc");
        $("#msg2").removeClass("d-none");
      } else if (
        !$("#password")
          .val()
          .match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/) &&
        $("#password").val() !== ""
      ) {
        $("#msg2").removeClass("d-none");
        $("#msg2").text(
          "رمز عبور باید شامل 6 کاراکتر و یک حرف بزرگ و یک حرف کوچک باشد."
        );
      } else if ($("#password").val() !== $("#rePassword").val()) {
        $("#msg2").removeClass("d-none");
        $("#msg2").text("رمز عبور و تکرار رمز عبور یکسان نمی باشند.");
      } else if ($("#password").val() === $("#rePassword").val()) {
        $("#submitBtn").click();
      }
    });
  });
});
