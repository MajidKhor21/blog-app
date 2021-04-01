$(document).ready(() => {
  $(".updateBtn").click(() => {
    $("#modalUpdate").modal("show");
    console.log($(this).closest("tr").children()[0]);
  });
});
