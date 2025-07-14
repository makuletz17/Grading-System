import { registerUser } from "./auth/register.js";
import { loginUser } from "./auth/login.js";

// Form actions
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("log-email").value;
  const pass = document.getElementById("log-pass").value;
  alert(await loginUser(email, pass));
});

document.getElementById("signup-btn").addEventListener("click", async () => {
  const email = document.getElementById("reg-email").value;
  const pass = document.getElementById("reg-pass").value;
  alert(await registerUser(email, pass));
});

// Form toggling
document.getElementById("register-btn").addEventListener("click", toggleForms);
document.getElementById("back-to-login").addEventListener("click", toggleForms);

function toggleForms() {
  document.getElementById("login-form").classList.toggle("hidden");
  document.getElementById("register-form").classList.toggle("hidden");
}
