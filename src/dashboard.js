import { createDot, getLevelName, removeDot } from "../common/Functions.js";
import { supabase } from "./../supabaseClient.js";

// ✅ Check session and redirect if not logged in
const { data } = await supabase.auth.getSession();
if (!data.session?.user?.id) window.location.href = "index.html";

const lastModule = JSON.parse(localStorage.getItem("activeModule") || "{}");

// ✅ Load user profile from localStorage
const user = JSON.parse(localStorage.getItem("userProfile"));
if (!user) {
  window.location.href = "index.html";
} else {
  buildSidebarTools();
  // Fill dropdown profile
  document.getElementById("menu-name").textContent = user.name;
  document.getElementById("menu-email").textContent = user.email;
  document.getElementById("menu-username").textContent = user.username;
  document.getElementById("menu-level").textContent = getLevelName(user.level);

  const statusDot = document.getElementById("menu-hold");
  statusDot.classList.add(user.is_hold ? "bg-red-600" : "bg-green-500");
  if (lastModule.folder) {
    loadModulePanel(lastModule.name || "Last Module", lastModule.folder);
  }

  // ✅ Restore highlight in sidebar
  const targetSelector =
    lastModule.folder === "./common/moduleDefine"
      ? "#load-module-define"
      : lastModule.folder === "./common/users"
      ? "#user-reg"
      : `[data-module="${lastModule.folder}"]`;

  const target = document.querySelector(targetSelector);
  if (target) {
    const dot = document.createElement("span");
    dot.className =
      "status-dot inline-block w-2 h-2 bg-green-500 rounded-full mr-2";
    target.prepend(dot);
    target.classList.add("bg-green-50");
  }
}

// ✅ Profile dropdown toggle
document.getElementById("profile-toggle").addEventListener("click", () => {
  document.getElementById("profile-menu").classList.toggle("hidden");
});

// ✅ Logout
document
  .getElementById("dropdown-logout")
  .addEventListener("click", async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userProfile");
    localStorage.removeItem("activeModule");
    window.location.href = "index.html";
  });

// 🧱 Load sidebar content and program structure
async function buildSidebarTools() {
  const sidebar = document.getElementById("sidebar-programs");
  sidebar.innerHTML = `<p class="px-4 py-2 text-gray-500 dark:text-gray-400">Loading sidebar...</p>`;

  try {
    const [parentsRes, programsRes] = await Promise.all([
      supabase
        .from("program_parent")
        .select("*")
        .order("seq", { ascending: true }),
      supabase.from("program").select("*").order("id", { ascending: true }),
    ]);

    const parents = parentsRes.data || [];
    const programs = programsRes.data || [];

    const modulesByParent = {};
    for (const program of programs) {
      if (!modulesByParent[program.parent_id]) {
        modulesByParent[program.parent_id] = [];
      }
      modulesByParent[program.parent_id].push(program);
    }

    for (const parentId in modulesByParent) {
      modulesByParent[parentId].sort((a, b) => a.seq - b.seq);
    }

    sidebar.innerHTML = ""; // Clear loading

    parents.forEach((parent) => {
      const groupId = `group-${parent.id}`;
      const expanded =
        localStorage.getItem(`sidebar-expanded-${parent.id}`) === "true";
      const modules = modulesByParent[parent.id] || [];

      const parentBlock = document.createElement("div");
      parentBlock.className =
        "border border-gray-300 dark:border-gray-700 rounded overflow-hidden";

      parentBlock.innerHTML = `
      <button class="w-full px-4 py-2 text-sm hover:bg-gray-700 dark:bg-gray-800 text-white flex justify-between items-center"  data-toggle="${groupId}">
        ${parent.parent_name}
        <svg 
          class="w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}" 
          data-arrow="${groupId}" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div id="${groupId}" 
        class="${
          expanded ? "max-h-96 " : "max-h-0"
        } overflow-hidden transition-all duration-300 text-gray-800 dark:text-gray-200 dark:bg-gray-800 ">
        ${modules
          .map(
            (m) => `
              <button 
        class="block w-full text-left px-6 py-2 text-sm border-t border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        data-module="${m.program_folder}/${m.program_name}">
          ${m.menu_name}
        </button>`
          )
          .join("")}
      </div>`;

      sidebar.appendChild(parentBlock);
    });

    // 👉 Toggle logic
    sidebar.querySelectorAll("[data-toggle]").forEach((btn) => {
      const groupId = btn.dataset.toggle;
      const group = document.getElementById(groupId);
      const arrow = sidebar.querySelector(`[data-arrow="${groupId}"]`);

      btn.addEventListener("click", () => {
        const isOpen = group.classList.contains("max-h-96");
        group.classList.toggle("max-h-0", isOpen);
        group.classList.toggle("max-h-96", !isOpen);
        arrow.classList.toggle("rotate-180", !isOpen);
        localStorage.setItem(`sidebar-expanded-${groupId}`, String(!isOpen));
      });
    });

    // 👉 Module click handlers
    sidebar.querySelectorAll("[data-module]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const folder = btn.dataset.module;
        const moduleName = btn.textContent.trim();

        // Remove green dot from others
        removeDot();

        // Add green dot to clicked
        btn.prepend(createDot());
        loadModulePanel(moduleName, folder);
      });
    });

    // ✅ Admin tools
    if (user.level === 1) {
      const adminBlock = document.createElement("div");
      adminBlock.className =
        "border border-gray-300 dark:border-gray-700 rounded overflow-hidden";

      adminBlock.innerHTML = `
       <button id="admin-toggle" class="w-full px-4 py-2 text-sm hover:bg-gray-700 dark:bg-gray-800 text-white flex justify-between items-center">
        <span>Admin Tools</span>
        <svg id="admin-arrow" class="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div id="admin-menu" class="max-h-0 overflow-hidden transition-all duration-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
        <button id="user-reg" class="block w-full text-left px-6 py-2 text-sm border-t border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">User Registration</button>
        <button id="load-module-define" class="block w-full text-left px-6 py-2 text-sm border-t border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
          Module Definition
        </button>
      </div>`;

      sidebar.appendChild(adminBlock);

      document.getElementById("admin-toggle").addEventListener("click", () => {
        const menu = document.getElementById("admin-menu");
        const arrow = document.getElementById("admin-arrow");
        const isOpen = menu.classList.contains("max-h-40");
        menu.classList.toggle("max-h-0", isOpen);
        menu.classList.toggle("max-h-40", !isOpen);
        arrow.classList.toggle("rotate-180", !isOpen);
      });

      const moduleBtn = document.getElementById("load-module-define");
      const userBtn = document.getElementById("user-reg");

      moduleBtn.addEventListener("click", () => {
        // Clear active indicators from all module buttons
        removeDot();
        moduleBtn.prepend(createDot());
        // Load module definition
        loadModulePanel("Program Definition", "./common/moduleDefine");
      });

      userBtn.addEventListener("click", () => {
        // Clear active indicators from all module buttons
        removeDot();
        userBtn.prepend(createDot());
        // Load module definition
        loadModulePanel("User Registration & Confirmation", "./common/users");
      });
    }
  } catch (err) {
    console.error("Sidebar error:", err);
    sidebar.innerHTML = `<p class="text-red-600 dark:text-red-400 px-4 py-2">Failed to load sidebar.</p>`;
  }
}

async function loadModulePanel(moduleName, moduleFolder) {
  localStorage.setItem(
    "activeModule",
    JSON.stringify({
      name: moduleName,
      folder: moduleFolder,
    })
  );

  const container = document.getElementById("module-panel");
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

  container.innerHTML = "";

  try {
    const res = await fetch(`${moduleFolder}.html`);
    if (!res.ok) throw new Error("Module HTML not found");
    const html = await res.text();
    container.innerHTML = html;

    const timestamp = Date.now(); // Cache busting
    const script = document.createElement("script");
    script.type = "module";
    script.src = `${moduleFolder}.js?t=${timestamp}`;
    container.appendChild(script);
  } catch (err) {
    container.innerHTML = `<p class='text-red-600'>Failed to load module "${moduleName}".</p>`;
    console.error(err);
  }
}
