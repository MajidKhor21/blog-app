$(document).ready(() => {
  localStorage.removeItem("user");
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
