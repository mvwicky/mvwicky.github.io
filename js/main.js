import "sanitize.css";
import "../css/main.scss";

function postData() {
  const psel = document.querySelector('select[name="post-select"]');
  psel.addEventListener("change", (e) => {
    const num = e.target.value;
    const opt = document.querySelector(`option[value="${num}"]`);
    const label = opt.getAttribute("label");
    const titles = document.querySelectorAll("div.post-title");
    Array.from(titles).forEach((t) => {
      const tags = t.dataset.tags.split(" ");
      const ids = Array.from(
        document.querySelectorAll(`#${t.getAttribute("id")}`)
      );
      if (tags.includes(label) || label === "all") {
        ids.forEach((p) => {
          p.classList.remove("hidden");
        });
      } else {
        ids.forEach((p) => {
          p.classList.add("hidden");
        });
      }
    });
  });
}

function main(e) {
  const postList = document.querySelector("div#posts-list");
  if (postList !== null) {
    postData();
  }
}

if (document.readyState !== "complete") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
