$(document).ready(() => {
  let user = JSON.parse(sessionStorage.getItem("user"));
  if (user) {
    $("#firstName").val(user.firstName);
    $("#lastName").val(user.lastName);
    $("#email").val(user.email);
    $("#username").val(user.username);
    $("#mobileNumber").val(user.mobileNumber);
  }
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

function submitFunc() {
  user = {
    firstName: $("#firstName").val(),
    lastName: $("#lastName").val(),
    email: $("#email").val(),
    username: $("#username").val(),
    mobileNumber: $("#mobileNumber").val(),
  };
  sessionStorage.setItem("user", JSON.stringify(user));
}
