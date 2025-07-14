import { supabase } from "./../supabaseClient.js";
console.log("dashboard.js loaded!");

const { data } = await supabase.auth.getSession();
if (!data.session?.user?.id) window.location.href = "index.html";

const user = JSON.parse(localStorage.getItem("userProfile"));
if (!user) {
  window.location.href = "index.html";
} else {
  document.getElementById("user-name").textContent = user.name;
  document.getElementById("user-email").textContent = user.email;
  document.getElementById("user-username").textContent = user.username;
  document.getElementById("user-level").textContent = user.level;
  document.getElementById("user-hold").textContent = user.is_hold
    ? "On Hold"
    : "Active";
}

document.getElementById("logout-btn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  localStorage.removeItem("userProfile");
  window.location.href = "index.html";
});

if (user.level === 1) {
  const adminLink = document.createElement("a");
  adminLink.href = "#";
  adminLink.className = "flex items-center gap-2";
  adminLink.innerHTML = `
  <div class="w-full">
    <button id="admin-toggle" class="flex items-center justify-between w-full px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">
      <span class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M6 12h12M6 6h12M6 18h12" />
        </svg>
        Admin Tools
      </span>
      <svg id="accordion-arrow" class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div id="admin-menu" class="mt-2 bg-white text-gray-800 rounded shadow-lg overflow-hidden transition-all duration-300 max-h-0">
      <a href="#" class="block px-4 py-2 hover:bg-gray-100">User Registration</a>
      <a href="#" class="block px-4 py-2 hover:bg-gray-100 border-b">Module Definition</a>
    </div>
  </div>
`;
  document.getElementById("admin-link-container").appendChild(adminLink);
}
const toggleBtn = document.getElementById("admin-toggle");
const menu = document.getElementById("admin-menu");
const arrow = document.getElementById("accordion-arrow");

toggleBtn.addEventListener("click", () => {
  menu.classList.toggle("max-h-0");
  menu.classList.toggle("max-h-40"); // adjust height to fit your content
  arrow.classList.toggle("rotate-180");
});
