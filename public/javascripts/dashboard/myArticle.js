$(document).ready(() => {
  let all = $("#allArticle").text();
  let username = $("#myUsername").text();
  console.log(all);
  let limit = 6;
  let max = all % limit;
  console.log(max);
  let pages = 1;
  let index = 0;
  while (index < all) {
    $("#pagination").append(
      `<li class="page-item" id="li${index}"><a class="page-link" href="/article/${username}?showArticle=${index}">${pages}</a></li>`
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
  console.log(Number(url));
  url = Number(url);
  let x;
  if (url % limit === 0) {
    x = url / limit + 1;
    $("#articleSpan").text(x);
    $(`#li${x}`).addClass("active");
  }
});
