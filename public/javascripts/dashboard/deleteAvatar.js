$(document).ready(() => {
  $("#deleteAvatar").click(() => {
    $.ajax({
      type: "put",
      url: "/user/removeAvatar",
      data: {
        avatar: "default",
      },
      success: function (response) {
        window.location.href = "/user/dashboard";
      },
    });
  });
});
