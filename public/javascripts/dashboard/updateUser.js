$(document).ready(() => {
  $("#cancelBtn").click(() => {
    location.reload();
  });
  $("#editBtn").click(() => {
    $("#msgAlert").addClass("d-none");
    $("#msgAlert2").addClass("d-none");
    $("input[type='text']").each(function () {
      if ($(this).val() === "") {
        $(this).attr("placeholder", "* الزامی");
      }
    });
    if (
      $("#firstName").val() &&
      $("#firstName").val().length >= 3 &&
      $("#firstName").val().length <= 30 &&
      $("#lastName").val() &&
      $("#lastName").val().length > 3 &&
      $("#lastName").val().length < 30 &&
      $("#mobileNumber").val() &&
      $("#mobileNumber")
        .val()
        .match(/^\d{11}$/)
    ) {
      $.ajax({
        type: "put",
        url: "/user/update",
        data: {
          firstName: $("#firstName").val(),
          lastName: $("#lastName").val(),
          gender: $("#gender2").val(),
          mobileNumber: $("#mobileNumber").val(),
          username: $("#username").val(),
          email: $("#email").val(),
          lastUpdate: Date.now(),
        },
        success: function (response) {
          $("#msgAlert2").removeClass("d-none");
          setTimeout(function () {
            location.reload();
          }, 2500);
        },
        error: function (err) {
          console.log(err);
          $("#msgAlert").removeClass("d-none");
        },
      });
    } else {
      $("#msgAlert").removeClass("d-none");
    }
  });
});
