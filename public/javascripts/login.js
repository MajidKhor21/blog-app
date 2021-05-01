$(document).ready(() => {
  sessionStorage.removeItem("user");
  $("#loginBtn").click(() => {
    $("input").each(function () {
      if (!$(this).val()) {
        $(this).addClass("plc");
      } else {
        $("#submitBtn").click();
      }
    });
  });
});
