import { supabase } from "../supabaseClient.js";
(async () => {
  const loading = document.getElementById("loading-indicator");
  const tabsContainer = document.getElementById("tabs");
  const contentContainer = document.getElementById("tab-content");

  loading.classList.remove("hidden");
  tabsContainer.classList.add("hidden");
  contentContainer.classList.add("hidden");

  const { data, error } = await supabase.from("program_parent").select("*");

  if (error || !data || data.length === 0) {
    loading.innerHTML =
      "<span class='text-red-600'>No modules available.</span>";
    return;
  }

  data.forEach((program, index) => {
    const tab = document.createElement("button");
    tab.textContent = program.parent_name || `Module ${index + 1}`;
    tab.className = `px-4 py-2 bg-indigo-200 text-indigo-700 rounded hover:bg-indigo-300 transition-opacity opacity-0`;

    tab.addEventListener("click", () => {
      localStorage.setItem("activeModuleTab", program.parent_name);
      contentContainer.innerHTML = `
      <h3 class="text-lg font-semibold mb-2">${program.parent_name}</h3>
      <p class="text-gray-600">ID: ${program.id}</p>
      <p class="mt-2 text-gray-800">${
        program.description || "No description provided."
      }</p>
    `;
    });

    tabsContainer.appendChild(tab);
    const savedModuleName = localStorage.getItem("activeModuleTab");

    let found = false;
    tabsContainer.querySelectorAll("button").forEach((btn, i) => {
      if (btn.textContent === savedModuleName) {
        btn.click();
        found = true;
      }
    });

    if (!found) {
      tabsContainer.querySelector("button")?.click(); // fallback
    }

    // 🪄 Delay fade-in
    setTimeout(() => {
      tab.classList.add("opacity-100");
    }, 100 * index);
  });

  // Hide spinner, show tabs and content
  loading.classList.add("hidden");
  tabsContainer.classList.remove("hidden");
  contentContainer.classList.remove("hidden");

  // Auto-click first tab
  tabsContainer.querySelector("button")?.click();
})();
