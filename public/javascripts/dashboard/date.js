$(document).ready(() => {
  let month = moment().format("jMMM");
  let dayOfWeek = moment().format("ddd");
  let day = moment().format("jD");
  month = month.replace("Far", "فروردین");
  month = month.replace("Ord", "اردیبهشت");
  month = month.replace("Kho", "خرداد");
  month = month.replace("Tir", "تیر");
  month = month.replace("Amo", "مرداد");
  month = month.replace("Sha", "شهریور");
  month = month.replace("Meh", "مهر");
  month = month.replace("Aab", "آبان");
  month = month.replace("Aaz", "آذر");
  month = month.replace("Dey", "دی");
  month = month.replace("Bah", "بهمن");
  month = month.replace("Esf", "اسفند");
  dayOfWeek = dayOfWeek.replace("Sun", "یکشنبه");
  dayOfWeek = dayOfWeek.replace("Mon", "دوشنبه");
  dayOfWeek = dayOfWeek.replace("Tue", "سه شنبه");
  dayOfWeek = dayOfWeek.replace("Wed", "چهارشنبه");
  dayOfWeek = dayOfWeek.replace("Thu", "پنج شنبه");
  dayOfWeek = dayOfWeek.replace("Fri", "جمعه");
  dayOfWeek = dayOfWeek.replace("Sat", "شنبه");

  let date = dayOfWeek + " " + day + " " + month;
  $("#dateNow").text(date);
  showTime();

  function showTime() {
    let date = new Date();
    let h = date.getHours(); // 0 - 23
    let m = date.getMinutes(); // 0 - 59
    let s = date.getSeconds(); // 0 - 59
    console.log(h, m, s);

    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;

    let time = h + ":" + m + ":" + s + " ";
    document.getElementById("MyClockDisplay").innerText = time;
    document.getElementById("MyClockDisplay").textContent = time;

    setTimeout(showTime, 1000);
  }
});
