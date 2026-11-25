import { requireAuth } from "./api.js";

if (requireAuth()) {
  document.querySelector("main").hidden = false;

  const addButton = document.getElementById("add-project");
  const formSection = document.getElementById("form-section");
  const form = document.getElementById("project-form");
  const cancelButton = document.getElementById("cancel-form");

  addButton.addEventListener("click", () => {
    formSection.hidden = false;
    form.elements.title.focus();
  });

  cancelButton.addEventListener("click", () => {
    form.reset();
    formSection.hidden = true;
  });

  form.addEventListener("submit", (event) => event.preventDefault());
}