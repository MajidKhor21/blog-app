CKEDITOR.replace("editor1", {
  filebrowserUploadUrl: "/article/uploader",
  height: 350,
});

let user = {};

$(document).ready(() => {
  $("#alertDanger")
    .fadeTo(4000, 500)
    .slideUp(500, function () {
      $("#alertDanger").slideUp(500);
    });
  let text = $("#describeValue").val();
  CKEDITOR.instances["editor1"].setData(text);
  let article = JSON.parse(localStorage.getItem("article"));

  if (
    $("#localTitle").val().includes("عنوان") &&
    $("#articleId").val() == article.id
  ) {
    $("#articleTitle").val(article.title);
    $("#articleBrief").val(article.brief);
    CKEDITOR.instances["editor1"].setData(article.describe);
  }
});

function submitFunc() {
  let text = CKEDITOR.instances["editor1"].getData();
  $("#hiddenInput").val(text);
  article = {
    id: $("#articleId").val(),
    title: $("#articleTitle").val(),
    brief: $("#articleBrief").val(),
    describe: text,
  };
  localStorage.setItem("article", JSON.stringify(article));
  document.getElementById("submitBtn").click();
}
