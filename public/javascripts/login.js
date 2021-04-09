$(document).ready(() => {
  $("#loginBtn").click(() => {
    $("#alertMsg").addClass("d-none");
    $("#msg").addClass("d-none");
    $("#msg2").addClass("d-none");
    $("input").each(function () {
      if (!$(this).val()) {
        $(this).addClass("plc");
        $("#alertMsg").removeClass("d-none");
      } else {
        $.ajax({
          type: "post",
          url: "/login",
          data: {
            username: $("#username").val(),
            password: $("#password").val(),
          },
          success: function (response) {
            $("#msg").removeClass("d-none");
            $("#passDiv").addClass("d-none");
            setTimeout(function () {
              window.location.href = "/user/dashboard";
            }, 2500);
          },
          error: function (err) {
            $("#msg2").removeClass("d-none");
            $("#passDiv").addClass("d-none");
          },
        });
      }
    });
  });
});
