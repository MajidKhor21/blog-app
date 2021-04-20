$(document).ready(() => {
  let a = $("#describe").text();
  $("#desc").html(a);
  $(".alert")
    .fadeTo(4000, 500)
    .slideUp(500, function () {
      $(".alert").slideUp(500);
    });
  $("#submitBtn").click(() => {
    $("#submit").click();
  });
  $("#cancelBtn").click(() => {
    if ($("#example1").val()) location.reload();
  });
  $("#example1").emojioneArea({});
  $(".emojionearea").emojioneArea({
    standalone: true,
  });
});
