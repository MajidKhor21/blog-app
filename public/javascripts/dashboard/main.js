$(document).ready(() => {
  $("#alertSuccess")
    .fadeTo(2000, 500)
    .slideUp(500, function () {
      $("#alertSuccess").slideUp(500);
    });
});
