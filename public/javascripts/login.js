$(document).ready(() => {
  $("#loginBtn").click(() => {
    $("#alertMsg").addClass("d-none");
    $("#msg").addClass("d-none");
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
            setTimeout(function () {
              window.location.href = "/dashboard";
            }, 2500);
          },
        });
      }
    });
  });
});
