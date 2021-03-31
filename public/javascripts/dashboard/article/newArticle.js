CKEDITOR.replace("editor1", { height: "350" });
UPLOADCARE_PUBLIC_KEY = "demopublickey";
CKEDITOR.replace("editor1", {
  extraPlugins: "uploadcare",
  toolbar: [["Uploadcare" /* your toolbar items */]],
  uploadcare: {
    publicKey: "278088aba54b3f3c3111", // set your public API key here
    multiple: true, // allow multi-file uploads
    crop: "1:1,4:3", // set crop options when handling images
    /* feel free to add more “object key” options here */
  },
});

UPLOADCARE_PUBLIC_KEY = "278088aba54b3f3c3111";
UPLOADCARE_TABS = "file camera url facebook gdrive instagram";
UPLOADCARE_EFFECTS =
  "crop,rotate,mirror,flip,enhance,sharp,blur,grayscale,invert";
UPLOADCARE_PREVIEW_STEP = true;
UPLOADCARE_CLEARABLE = true;

uploadcare.registerTab("preview", uploadcareTabEffects);

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
