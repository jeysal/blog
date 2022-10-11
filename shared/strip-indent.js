import { stripIndent } from "https://cdn.jsdelivr.net/npm/common-tags@1.8.2/+esm";

document.querySelectorAll("[data-stripindent]").forEach((element) => {
  element.textContent = stripIndent(element.textContent);
});
