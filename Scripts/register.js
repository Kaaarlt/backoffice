import { register } from "./api.js";

const form = document.getElementById("register-form");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;

  try {
    await register({
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      itsonId: form.elements.itsonId.value.trim(),
      password: form.elements.password.value,
    });
    location.href = "login.html";
  } catch (error) {
    message.textContent = error.message;
    button.disabled = false;
  }
});