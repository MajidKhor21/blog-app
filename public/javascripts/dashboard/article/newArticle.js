CKEDITOR.replace("editor1", {
  filebrowserUploadUrl: "/article/uploader",
  height: 350,
});

$(document).ready(() => {
  $("#alertDanger")
    .fadeTo(4000, 500)
    .slideUp(500, function () {
      $("#alertDanger").slideUp(500);
    });
});

function submitFunc() {
  let text = CKEDITOR.instances["editor1"].getData();
  $("#hiddenInput").val(text);
  document.getElementById("submitBtn").click();
}
