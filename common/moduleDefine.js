import { supabase } from "../supabaseClient.js";
import {
  adjustGridHeight,
  getAvailableLevels,
  getIp,
  getLevelName,
  showToast,
} from "./Functions.js";

const gridWrapper = document.getElementById("grid-wrapper");
const tabsContainer = document.getElementById("tabs-container");
const loading = document.getElementById("loading-indicator");
let selectedRecord = null;

let activeTabId = localStorage.getItem("activeModuleTab") || null;

window.addEventListener("resize", adjustGridHeight);

// 📊 Render Grid.js table
function renderGrid(records) {
  gridWrapper.innerHTML = ""; // Reset container

  // Create separate container for Grid
  const gridContainer = document.createElement("div");
  gridWrapper.appendChild(gridContainer);

  // Render Grid.js into its own clean container
  new Grid({
    columns: [
      { name: "Menu Name" },
      { name: "Program Name" },
      { name: "Folder" },
      { name: "Group" },
      { name: "Active" },
      { name: "Level" },
    ],
    data: records.map((p) => [
      p.menu_name,
      p.program_name,
      p.program_folder,
      p.group || "-",
      p.is_active ? "✅" : "❌",
      getLevelName(p.level),
    ]),
    pagination: false,
    sort: true,
    search: false,
    className: {
      table:
        "w-full text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-separate border-spacing-0 rounded",
      th: "border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 text-left px-3 py-1 font-medium text-gray-800 dark:text-gray-200",
      td: "border border-gray-200 dark:border-gray-700 px-4 py-1",
    },
  }).render(gridContainer);

  gridContainer.addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    if (!row || !row.rowIndex || row.rowIndex === 0) return;

    const index = row.rowIndex - 1;
    const isAlreadySelected =
      row.classList.contains("bg-indigo-100") ||
      row.classList.contains("dark:bg-gray-700");

    gridContainer
      .querySelectorAll("tr")
      .forEach((tr) =>
        tr.classList.remove("bg-indigo-100", "dark:bg-gray-700")
      );

    if (isAlreadySelected) {
      selectedRecord = null;
    } else {
      selectedRecord = records[index];
      row.classList.add("bg-indigo-100", "dark:bg-gray-700");
    }
  });

  // Attach actions
  document.getElementById("grid-add").addEventListener("click", () => {
    showAddForm();
  });

  document.getElementById("grid-edit").addEventListener("click", () => {
    if (!selectedRecord) {
      showToast("No record selected", "warning");
      return;
    }
    showEditForm(selectedRecord);
  });

  document.getElementById("grid-toggle").addEventListener("click", () => {
    console.log("Enable/Disable action triggered");
  });
}

// 📂 Fetch tabs and initialize UI
async function getTabs() {
  loading.classList.remove("hidden");
  try {
    const { data: parents, error } = await supabase
      .from("program_parent")
      .select("*");
    if (error || !parents || parents.length === 0) {
      loading.innerHTML = `<span class='text-red-600'>No modules available.</span>`;
      return;
    }

    tabsContainer.innerHTML = "";
    parents.forEach((parent, index) => {
      const btn = document.createElement("button");
      btn.className = `
        px-3 py-1 text-sm rounded-t-md border border-gray-300 dark:border-gray-700
        hover:bg-gray-200 dark:hover:bg-gray-700
        ${
          parent.id === activeTabId
            ? "bg-gray-300 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white"
            : "text-gray-700 dark:text-gray-300"
        }`;

      btn.textContent = parent.parent_name || `Module ${index + 1}`;
      btn.dataset.id = parent.id;

      btn.addEventListener("click", () => {
        activeTabId = parent.id;
        localStorage.setItem("activeModuleTab", activeTabId);
        getModules(activeTabId);
        highlightActiveTab();
      });

      tabsContainer.appendChild(btn);
    });

    if (!activeTabId && parents.length > 0) {
      activeTabId = parents[0].id;
      localStorage.setItem("activeModuleTab", activeTabId);
    }

    highlightActiveTab();
    await getModules(activeTabId);
  } catch (e) {
    console.error("Tab fetch failed:", e);
    loading.innerHTML = `<span class='text-red-600'>Error loading modules.</span>`;
  } finally {
    loading.classList.add("hidden");
  }
}

// ✨ Highlight the current tab
function highlightActiveTab() {
  tabsContainer.querySelectorAll("button").forEach((btn) => {
    btn.classList.remove("bg-gray-300", "font-semibold");
    if (btn.dataset.id === activeTabId) {
      btn.classList.add(
        "bg-gray-300",
        "dark:bg-gray-800",
        "font-semibold",
        "text-gray-900",
        "dark:text-white"
      );
    }
  });
}

// 📋 Fetch module data for a parent tab
async function getModules(parentId) {
  loading.classList.remove("hidden");
  try {
    const { data: programs, error } = await supabase
      .from("program")
      .select("*")
      .eq("parent_id", parentId);

    if (error || !programs || programs.length === 0) {
      gridWrapper.innerHTML = `<div class="p-4 text-gray-500">No programs found.</div>`;
      return;
    }

    renderGrid(programs);
  } catch (err) {
    console.error("Module fetch error:", err);
    gridWrapper.innerHTML = `<div class="p-4 text-red-600">Failed to load module grid.</div>`;
  } finally {
    loading.classList.add("hidden");
  }
}

function showAddForm() {
  const overlay = document.getElementById("modal-overlay");
  const content = document.getElementById("modal-content");

  const levels = getAvailableLevels();
  const levelOptions = levels
    .map((l) => `<option value="${l.id}">${l.text}</option>`)
    .join("");

  content.innerHTML = `
    <h2 class="text-lg font-semibold mb-4">Add New Module</h2>
    <div class="space-y-3">
      <input id="add-mname" type="text" placeholder="Menu Name" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900" />
      <input id="add-pname" type="text" placeholder="Program Name" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900" />
      <input id="add-folder" type="text" placeholder="Program Folder" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900" />
      <select id="add-level" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
        ${levelOptions}
      </select>
    </div>
    <div class="flex justify-end mt-5 gap-2">
      <button id="cancel-form" class="flex items-center gap-1 px-3 py-1 text-sm rounded bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-600 shadow-sm">Cancel</button>
      <button id="submit-form" class="flex items-center gap-1 px-3 py-1 text-sm rounded bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-600 shadow-sm">Submit</button>
    </div>
  `;

  overlay.classList.remove("hidden");

  // Close modal
  document.getElementById("cancel-form").addEventListener("click", () => {
    overlay.classList.add("hidden");
  });

  // Submit logic
  document.getElementById("submit-form").addEventListener("click", async () => {
    const mname = document.getElementById("add-mname").value.trim();
    const pname = document.getElementById("add-pname").value.trim();
    const folder = document.getElementById("add-folder").value.trim();
    const level = document.getElementById("add-level").value;

    const rawProfile = localStorage.getItem("userProfile");
    if (!rawProfile) {
      alert("No logged-in user found");
      return;
    }
    const userProfile = JSON.parse(rawProfile);

    if (!mname || !pname || !folder || !level) {
      alert("Please fill all fields");
      return;
    }

    const ip = await getIp(); // 🔄 wait for IP before insert
    const { error } = await supabase.from("program").insert({
      menu_name: mname,
      program_name: pname,
      program_folder: folder,
      level: parseInt(level),
      parent_id: parseInt(activeTabId),
      user_id: userProfile.username, // ✅ confirm this is actually the user ID
      is_active: true,
      ip_add: ip, // ✅ now contains the actual IP string
    });

    if (error) {
      console.error("Insert failed:", error);
      alert("Error adding module");
    } else {
      overlay.classList.add("hidden");
      await getModules(activeTabId); // Refresh grid
    }
  });
}

function showEditForm(record) {
  const overlay = document.getElementById("modal-overlay");
  const content = document.getElementById("modal-content");

  const levels = getAvailableLevels();
  const levelOptions = levels
    .map(
      (l) =>
        `<option value="${l.id}" ${
          record.level === l.value ? "selected" : ""
        }>${l.text}</option>`
    )
    .join("");

  content.innerHTML = `
    <h2 class="text-lg font-semibold mb-4">Edit Module</h2>
    <div class="space-y-3">
      <input id="edit-mname" type="text" value="${record.menu_name}" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900" />
      <input id="edit-pname" type="text" value="${record.program_name}" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900" />
      <input id="edit-folder" type="text" value="${record.program_folder}" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900" />
      <select id="edit-level" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
        ${levelOptions}
      </select>
    </div>
    <div class="flex justify-end mt-5 gap-2">
      <button id="cancel-edit" class="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-400">Cancel</button>
      <button id="submit-edit" class="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-500">Update</button>
    </div>
  `;

  overlay.classList.remove("hidden");

  document.getElementById("cancel-edit").addEventListener("click", () => {
    overlay.classList.add("hidden");
  });

  document.getElementById("submit-edit").addEventListener("click", async () => {
    const mname = document.getElementById("edit-mname").value.trim();
    const pname = document.getElementById("edit-pname").value.trim();
    const folder = document.getElementById("edit-folder").value.trim();
    const level = parseInt(document.getElementById("edit-level").value);

    const rawProfile = localStorage.getItem("userProfile");
    const userProfile = rawProfile ? JSON.parse(rawProfile) : null;
    if (!userProfile || !userProfile.id) {
      showToast("Missing user info");
      return;
    }

    const ip = await getIp(); // 🔄 wait for IP before insert
    const { error } = await supabase
      .from("program")
      .update({
        menu_name: mname,
        program_name: pname,
        program_folder: folder,
        level: level,
        user_id: userProfile.id, // Re-attributing edit
        ip_add: ip,
      })
      .eq("id", record.id);

    if (error) {
      console.error("Edit failed:", error);
      showToast("Error updating module");
    } else {
      overlay.classList.add("hidden");
      await getModules(activeTabId);
    }
  });
}

// 🚀 Initialize layout
(async () => {
  adjustGridHeight();
  await getTabs();
})();
