import { login } from "./api.js";

const form = document.getElementById("login-form");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;

  try {
    await login({
      email: form.elements.email.value.trim(),
      password: form.elements.password.value,
    });
    location.href = "home.html";
  } catch (error) {
    message.textContent = error.message;
    button.disabled = false;
  }
});