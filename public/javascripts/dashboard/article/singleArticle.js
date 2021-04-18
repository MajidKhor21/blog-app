$(document).ready(() => {
  let a = $("#describe").text();
  console.log(a);
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
    location.reload();
  });
  $("#example1").emojioneArea({});
  $(".emojionearea").emojioneArea({
    standalone: true,
  });
});
