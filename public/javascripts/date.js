$(document).ready(() => {
  m = moment().format("jMMM jDD ddd");
  console.log(m);
  // $("#dateNow").text(moment().format("jYYYY/jMMM/jDDD HH:mm:ss"));
  // let date = jalaali.toJalaali(new Date());
  // $("#dateNow").text(date.jy + " / " + date.jm + " / " + date.jd);
  // showTime();

  // function showTime() {
  //   let date = new Date();
  //   let h = date.getHours(); // 0 - 23
  //   let m = date.getMinutes(); // 0 - 59
  //   let s = date.getSeconds(); // 0 - 59
  //   console.log(h, m, s);
  //   let session = "ق.ظ";

  //   if ((h) => 12) {
  //     session = "ب.ظ";
  //   } else {
  //     session = "ق.ظ";
  //   }

  //   h = h < 10 ? "0" + h : h;
  //   m = m < 10 ? "0" + m : m;
  //   s = s < 10 ? "0" + s : s;

  //   let time = session + " " + h + ":" + m + ":" + s + " ";
  //   document.getElementById("MyClockDisplay").innerText = time;
  //   document.getElementById("MyClockDisplay").textContent = time;

  //   setTimeout(showTime, 1000);
  // }
});
