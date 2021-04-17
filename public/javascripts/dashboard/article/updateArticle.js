$(document).ready(() => {
  $(".updateBtn").click(() => {
    $("#modalUpdate").modal("show");
    console.log($(this).closest("tr").children()[0]);
  });
  $(".alert")
    .fadeTo(2000, 500)
    .slideUp(500, function () {
      $(".alert").slideUp(500);
    });
});
