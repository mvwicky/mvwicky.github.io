import "normalize.css";
import "../scss/main.scss";

function postData(select) {
  select.addEventListener("change", () => {
    const num = select.value;
    const opt = document.querySelector(`option[value="${num}"]`);
    const label = opt.getAttribute("label");
    const titles = document.querySelectorAll("div.post-title");
    titles.forEach((title) => {
      const tags = title.dataset.tags.split(" ");
      const ids = Array.from(document.querySelectorAll(`#${title.id}`));
      if (tags.includes(label) || label === "all") {
        ids.forEach((p) => {
          p.classList.remove("d-none");
        });
      } else {
        ids.forEach((p) => {
          p.classList.add("d-none");
        });
      }
    });
  });
}

function main() {
  document.removeEventListener("DOMContentLoaded", main);
  const postSelect = document.querySelector('select[name="post-select"]');
  if (postSelect !== null) {
    postData(postSelect);
  }
}

if (document.readyState !== "complete") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
