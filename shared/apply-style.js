document.querySelectorAll("[data-applystyle]").forEach((element) => {
  const styleElement = document.createElement("style");
  styleElement.textContent = element.textContent;
  document.head.append(styleElement);
});
