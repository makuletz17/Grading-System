import { supabase } from "./../supabaseClient.js";

// ✅ Session check
const { data } = await supabase.auth.getSession();
if (!data.session?.user?.id) window.location.href = "index.html";

// ✅ Load user profile from storage
const user = JSON.parse(localStorage.getItem("userProfile"));
if (!user) {
  window.location.href = "index.html";
} else {
  // Fill dropdown profile
  document.getElementById("my-name").textContent = user.name;
  document.getElementById("menu-name").textContent = user.name;
  document.getElementById("menu-email").textContent = user.email;
  document.getElementById("menu-username").textContent = user.username;
  document.getElementById("menu-level").textContent = user.level;
  document.getElementById("menu-hold").textContent = user.is_hold
    ? "On Hold"
    : "Active";
}

// ✅ Profile dropdown toggle
document.getElementById("profile-toggle").addEventListener("click", () => {
  document.getElementById("profile-menu").classList.toggle("hidden");
});

// ✅ Logout via dropdown
document
  .getElementById("dropdown-logout")
  .addEventListener("click", async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userProfile");
    localStorage.removeItem("activeModule");
    window.location.href = "index.html";
  });

// ✅ Admin tools: inject accordion
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
        <button id="load-module-define" class="block w-full px-4 py-2 text-left hover:bg-gray-100 border-b">Module Definition</button>
      </div>
    </div>
  `;
  document.getElementById("admin-link-container").appendChild(adminLink);

  // ✅ Accordion toggle
  document.getElementById("admin-toggle").addEventListener("click", () => {
    const menu = document.getElementById("admin-menu");
    const arrow = document.getElementById("accordion-arrow");
    menu.classList.toggle("max-h-0");
    menu.classList.toggle("max-h-40");
    arrow.classList.toggle("rotate-180");
  });

  // ✅ Module loader
  let moduleCache = null;
  const container = document.getElementById("module-panel");

  async function loadModulePanel(moduleName) {
    localStorage.setItem("activeModule", moduleName);

    container.classList.remove("hidden");
    container.classList.add(
      "transition-all",
      "duration-500",
      "transform",
      "translate-x-0",
      "opacity-0"
    );
    setTimeout(() => {
      container.classList.remove("opacity-0");
      container.classList.add("opacity-100");
    }, 10);

    container.innerHTML = `<p class='text-gray-500'>Loading ${moduleName}...</p>`;

    try {
      const res = await fetch(`./common/${moduleName}.html`);
      if (!res.ok) throw new Error("HTML not found");
      const html = await res.text();
      moduleCache = html;
      container.innerHTML = html;

      const script = document.createElement("script");
      script.type = "module";
      script.src = `./common/${moduleName}.js`;
      container.appendChild(script);
    } catch (err) {
      container.innerHTML = `<p class='text-red-500'>Failed to load module "${moduleName}".</p>`;
      console.error(err);
    }
  }

  // ✅ Load module on button click
  document
    .getElementById("load-module-define")
    ?.addEventListener("click", () => {
      loadModulePanel("moduleDefine");
    });

  // ✅ Auto-load previously opened module
  const cached = localStorage.getItem("activeModule");
  if (cached) {
    loadModulePanel(cached);
  }
}
