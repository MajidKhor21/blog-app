$(document).ready(() => {
  $(".alert")
    .fadeTo(4000, 500)
    .slideUp(500, function () {
      $(".alert").slideUp(500);
    });

  let all = $("#allArticle").text();
  let limit = 6;
  let pages = 1;
  let index = 0;
  while (index < all) {
    $("#pagination").append(
      `<li class="page-item" id="li${index}"><a class="page-link" href="/user/dashboard?showArticle=${index}">${pages}</a></li>`
    );
    pages++;
    index = index + limit;
  }

  let selector = "#pagination li";

  $(selector).on("click", function () {
    $(this).addClass("active");
  });

  let url = document.URL;
  url = url.substr(-1);
  url = Number(url);
  let x;
  if (url % limit === 0) {
    x = url / limit + 1;
    $("#articleSpan").text(x);
    $(`#li${x}`).addClass("active");
  }
});
