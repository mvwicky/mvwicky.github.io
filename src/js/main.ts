import "../scss/main.scss";

function hideAll(elements: NodeListOf<HTMLElement>) {
  elements.forEach((elem) => elem.classList.add("d-none"));
}

function showAll(elements: NodeListOf<HTMLElement>) {
  elements.forEach((elem) => elem.classList.remove("d-none"));
}

function postData(select: HTMLSelectElement) {
  select.addEventListener("change", () => {
    const opt = select.selectedOptions[0];
    const tag = opt.label;
    if (tag === "all") {
      showAll(document.querySelectorAll(".post-attr"));
    } else {
      const titles = document.querySelectorAll<HTMLElement>("div.post-title");
      titles.forEach((title) => {
        const tags = (title.dataset.tags || "").split(" ");
        const post = title.dataset.post || "-1";
        const func = tags.includes(tag) ? showAll : hideAll;
        func(document.querySelectorAll(`[data-post="${post}"]`));
      });
    }
  });
}

function main() {
  document.removeEventListener("DOMContentLoaded", main);
  const postSelect = document.querySelector<HTMLSelectElement>(
    'select[name="post-select"]'
  );
  if (postSelect !== null) {
    postData(postSelect);
  }
}

if (document.readyState !== "complete") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
