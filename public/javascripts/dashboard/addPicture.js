$(document).ready(() => {
  $(".alert")
    .fadeTo(4000, 500)
    .slideUp(500, function () {
      $(".alert").slideUp(500);
    });
  let inputs = document.querySelectorAll(".file-input");

  for (let i = 0, len = inputs.length; i < len; i++) {
    customInput(inputs[i]);
  }

  function customInput(el) {
    const fileInput = el.querySelector('[type="file"]');
    const label = el.querySelector("[data-js-label]");

    fileInput.onchange = fileInput.onmouseout = function () {
      if (!fileInput.value) return;

      let value = fileInput.value.replace(/^.*[\\\/]/, "");
      el.className += " -chosen";
      label.innerText = value;
    };
  }
});
