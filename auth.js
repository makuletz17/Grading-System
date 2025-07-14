import { registerUser } from "./auth/register.js";
import { loginUser } from "./auth/login.js";
import { supabase } from "./supabaseClient.js";

const { data: userSession } = await supabase.auth.getSession();

// If session and user data exist, redirect to dashboard
if (userSession.session?.user?.id) {
  window.location.href = "dashboard.html";
}

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
  showToast(result, result.includes("Welcome") ? "success" : "error");

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

  showToast(result, result.includes("success") ? "success" : "error");

  // Re-enable
  btn.disabled = false;
  usernameInput.disabled = false;
  emailInput.disabled = false;
  passInput.disabled = false;
  nameInput.disabled = false;
  text.textContent = "Sign Up";
  spinner.classList.add("hidden");
});

// Form toggling
document.getElementById("register-btn").addEventListener("click", toggleForms);
document.getElementById("back-to-login").addEventListener("click", toggleForms);

function toggleForms() {
  document.getElementById("login-form").classList.toggle("hidden");
  document.getElementById("register-form").classList.toggle("hidden");
}

function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className =
    "fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 transition duration-300";

  // Style by type
  toast.classList.add(
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-gray-900"
  );

  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 5000);
}
