CKEDITOR.replace("editor1");
UPLOADCARE_PUBLIC_KEY = "demopublickey";
CKEDITOR.replace("editor1", {
  extraPlugins: "uploadcare",
  uploadcare: {
    multiple: true,
  },
});

function submitFunc() {
  let text = CKEDITOR.instances["editor1"].getData();
  $("#hiddenInput").val(text);
  document.getElementById("submitBtn").click();
}
