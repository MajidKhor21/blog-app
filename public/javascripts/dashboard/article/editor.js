CKEDITOR.replace("editor1");
UPLOADCARE_PUBLIC_KEY = "demopublickey";
CKEDITOR.replace("editor1", {
  extraPlugins: "uploadcare",
  uploadcare: {
    multiple: true,
  },
});

// $(document).ready(()=>{
//   let text = document.querySelectorAll('.cke_editable')[0].innerHTML;

// })

$(document).ready(() => {
  $("#submitBtn").click(() => {
    let text = CKEDITOR.instances["editor1"].getData();
    console.log(text);
    $("#hiddenInput").val(text);
  });
});

// function submitFunc() {
//   // let text = document.querySelectorAll(".cke_editable")[0].innerHTML;
//   let text = CKEDITOR.instances["editor1"].getData();
//   console.log(text);
//   $("#hiddenInput").val(text);
//   $.ajax({
//     type: "post",
//     url: "/user/article/add",
//     success: function (response) {},
//   });
// }

// function submitFunc() {
//   var objEditor1 = CKEDITOR.instances["editor1"];
//   input = objEditor1.getData();
//   alert(input);
//   var fd = new FormData();
//   var files = $("#picture")[0].files;

//   // Check file selected or not
//   if (files.length > 0) {
//     fd.append("picture", files[0]);
//     console.log(fd);
//     console.log(input);
//     $.ajax({
//       type: "post",
//       url: "/user/article/add",
//       data: {
//         fd: fd,
//         input: input,
//       },
//       success: function (response) {},
//     });
//   }
// }
