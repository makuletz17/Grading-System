import { registerUser } from "./auth/register.js";
import { loginUser } from "./auth/login.js";
import { supabase } from "./supabaseClient.js";

const { data: userSession } = await supabase.auth.getSession();

// If session and user data exist, redirect to dashboard
if (userSession.session?.user?.id) {
  window.location.href = "dashboard.html";
}

const emailInput = document.getElementById("log-email");
const passInput = document.getElementById("log-pass");

[emailInput, passInput].forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      document.getElementById("login-btn")?.click();
    }
  });
});

const divmsg = document.getElementById("success-msg");
// Form actions
document.getElementById("login-btn").addEventListener("click", async () => {
  const btn = document.getElementById("login-btn");
  const text = document.getElementById("login-text");
  const spinner = document.getElementById("login-spinner");

  const emailInput = document.getElementById("log-email");
  const passInput = document.getElementById("log-pass");

  // Disable everything
  btn.disabled = true;
  emailInput.disabled = true;
  passInput.disabled = true;
  text.textContent = "Logging in...";
  spinner.classList.remove("hidden");

  const email = emailInput.value;
  const password = passInput.value;

  const result = await loginUser(email, password);
  if (result.includes("success")) {
    divmsg.innerHTML = "✅ Please check your email for confirmation";
    divmsg.classList.remove("hidden");
    divmsg.classList.add("success-box"); // Ensure correct styling
  } else {
    divmsg.innerHTML = "❌ Error. Please try again.";
    divmsg.classList.remove("hidden");
    divmsg.classList.add("error-box"); // Optional: define error styling
  }
  // Optionally auto-hide after a few seconds
  setTimeout(() => {
    divmsg.classList.add("hidden");
  }, 5000);

  // Re-enable
  btn.disabled = false;
  emailInput.disabled = false;
  passInput.disabled = false;
  text.textContent = "Login";
  spinner.classList.add("hidden");
});

document.getElementById("signup-btn").addEventListener("click", async () => {
  const btn = document.getElementById("signup-btn");
  const text = document.getElementById("signup-text");
  const spinner = document.getElementById("signup-spinner");
  const backToLogin = document.getElementById("back-to-login");

  const usernameInput = document.getElementById("reg-username");
  const emailInput = document.getElementById("reg-email");
  const passInput = document.getElementById("reg-pass");
  const nameInput = document.getElementById("reg-name");

  // Disable everything
  btn.disabled = true;
  usernameInput.disabled = true;
  emailInput.disabled = true;
  passInput.disabled = true;
  nameInput.disabled = true;
  text.textContent = "Signing up...";
  spinner.classList.remove("hidden");

  const result = await registerUser({
    username: usernameInput.value,
    email: emailInput.value,
    password: passInput.value,
    name: nameInput.value,
  });

  if (result.includes("success")) {
    divmsg.innerHTML = "✅ Please check your email for confirmation";
    divmsg.classList.remove("hidden");
    divmsg.classList.add("success-box"); // Ensure correct styling
  } else {
    divmsg.innerHTML = "❌ Error. Please try again.";
    divmsg.classList.remove("hidden");
    divmsg.classList.add("error-box"); // Optional: define error styling
  }

  // Optionally auto-hide after a few seconds
  setTimeout(() => {
    divmsg.classList.add("hidden");
  }, 5000);

  // Re-enable
  btn.disabled = false;
  usernameInput.disabled = false;
  emailInput.disabled = false;
  passInput.disabled = false;
  nameInput.disabled = false;
  text.textContent = "Sign Up";
  spinner.classList.add("hidden");
  backToLogin.click();
});

// Form toggling
document.getElementById("register-btn").addEventListener("click", toggleForms);
document.getElementById("back-to-login").addEventListener("click", toggleForms);

function toggleForms() {
  document.getElementById("login-form").classList.toggle("hidden");
  document.getElementById("register-form").classList.toggle("hidden");
}
