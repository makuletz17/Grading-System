import { supabase } from "../supabaseClient.js";
import {
  getAvailableLevels,
  getLevelName,
  showConfirmation,
  showToast,
} from "./Functions.js";

let selectedUser = null;

// Render user grid
async function renderUserGrid() {
  const wrapper = document.getElementById("grid-wrapper");
  wrapper.innerHTML = "";

  const { data: users, error } = await supabase.from("users").select("*");
  if (error || !users) {
    wrapper.innerHTML = `<p class="text-red-500 dark:text-red-400">Failed to load users.</p>`;
    return;
  }

  const toolbar = document.createElement("div");
  toolbar.className = "flex gap-2 mb-4";

  toolbar.innerHTML = `
    <button id="user-add" class="flex items-center gap-1 px-3 py-1 text-sm rounded bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-600 shadow-sm">
      <i class="fas fa-user-plus"></i> Add
    </button>
    <button id="user-edit" class="flex items-center gap-1 px-3 py-1 text-sm rounded bg-gray-800 text-gray-100 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 shadow-sm" disabled>
      <i class="fas fa-user-edit"></i> Edit
    </button>
    <button id="user-delete" class="flex items-center gap-1 px-3 py-1 text-sm rounded bg-gray-800 text-gray-100 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 shadow-sm" disabled>
      <i class="fas fa-trash"></i> Delete
    </button>
    <button id="user-confirm" class="flex items-center gap-1 px-3 py-1 text-sm rounded bg-gray-800 text-gray-100 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 shadow-sm" disabled>
      <i class="fas fa-check-circle"></i> Confirm
    </button>
  `;
  wrapper.appendChild(toolbar);

  const gridContainer = document.createElement("div");
  wrapper.appendChild(gridContainer);

  const table = document.createElement("table");
  table.className = `
  w-full text-sm 
  border border-gray-600 dark:border-gray-600 
  bg-white dark:bg-gray-900 
  text-gray-800 dark:text-gray-100 
  border-collapse
`;
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr class="bg-gray-200 dark:bg-gray-700 text-left">
      <th class="border border-gray-600 dark:border-gray-600 px-3 py-1">Full Name</th>
      <th class="border border-gray-600 dark:border-gray-600 px-3 py-1">Username</th>
      <th class="border border-gray-600 dark:border-gray-600 px-3 py-1">Email</th>
      <th class="border border-gray-600 dark:border-gray-600 px-3 py-1">Role</th>
      <th class="border border-gray-600 dark:border-gray-600 px-3 py-1">Registered</th>
      <th class="border border-gray-600 dark:border-gray-600 px-3 py-1">Hold</th>
      <th class="border border-gray-600 dark:border-gray-600 px-3 py-1">Date Created</th>
      <th class="border border-gray-600 dark:border-gray-600 px-3 py-1">TimeStamp</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  users.forEach((u, index) => {
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";

    row.innerHTML = `
      <td class="border border-gray-600 dark:border-gray-600  px-3 py-1">${
        u.name
      }</td>
      <td class="border border-gray-600 dark:border-gray-600  px-3 py-1">${
        u.username
      }</td>
      <td class="border border-gray-600 dark:border-gray-600  px-3 py-1">${
        u.email
      }</td>
      <td class="border border-gray-600 dark:border-gray-600  px-3 py-1">${getLevelName(
        u.level
      )}</td>
      <td class="border border-gray-600 dark:border-gray-600  px-3 py-1">${
        u.is_registered ? "✅" : "❌"
      }</td>
      <td class="border border-gray-600 dark:border-gray-600 px-3 py-1">${
        u.is_hold ? "🔒" : "✅"
      }</td>
      <td class="border border-gray-600 dark:border-gray-600 px-3 py-1">${
        u.date_created
      }</td>
      <td class="border border-gray-600 dark:border-gray-600 px-3 py-1">${
        u.created_at
      }</td>
    `;

    row.addEventListener("click", () => {
      const isSelected = row.classList.contains("bg-indigo-100");

      tbody
        .querySelectorAll("tr")
        .forEach((tr) =>
          tr.classList.remove("bg-indigo-100", "dark:bg-gray-700")
        );

      if (isSelected) {
        selectedUser = null;
      } else {
        selectedUser = u;
        row.classList.add("bg-indigo-100", "dark:bg-gray-700");
      }
      updateToolbarStates();
    });

    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  gridContainer.appendChild(table);

  // Button actions
  document
    .getElementById("user-add")
    .addEventListener("click", () => showUserForm("add"));

  document.getElementById("user-edit").addEventListener("click", () => {
    if (!selectedUser) return showToast("No user selected", "warning");
    showUserForm("edit", selectedUser);
  });

  document.getElementById("user-delete").addEventListener("click", () => {
    if (!selectedUser) return showToast("No user selected", "warning");
    showConfirmation(`Delete user "${selectedUser.username}"?`, async () => {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedUser.id);
      if (error) showToast("Failed to delete user", "error");
      else showToast("User deleted", "success");
    });
  });

  document
    .getElementById("user-confirm")
    .addEventListener("click", async () => {
      if (!selectedUser) return showToast("No user selected", "warning");
      showConfirmation(
        `Confirm registration for "${selectedUser.username}"?`,
        async () => {
          const { error } = await supabase
            .from("users")
            .update({ is_registered: true })
            .eq("id", selectedUser.id);
          if (error) showToast("Confirmation failed", "error");
          else showToast("User confirmed", "success");
        }
      );
      await renderUserGrid();
    });
}

function updateToolbarStates() {
  const editBtn = document.getElementById("user-edit");
  const deleteBtn = document.getElementById("user-delete");
  const confirmBtn = document.getElementById("user-confirm");

  const enabledStyle = "opacity-100 cursor-pointer";
  const disabledStyle = "opacity-50 cursor-not-allowed";

  if (selectedUser) {
    editBtn.disabled = false;
    deleteBtn.disabled = false;

    editBtn.className = editBtn.className.replace(disabledStyle, enabledStyle);
    deleteBtn.className = deleteBtn.className.replace(
      disabledStyle,
      enabledStyle
    );

    if (!selectedUser.is_registered) {
      confirmBtn.disabled = false;
      confirmBtn.className = confirmBtn.className.replace(
        disabledStyle,
        enabledStyle
      );
    } else {
      confirmBtn.disabled = true;
      confirmBtn.className = confirmBtn.className.replace(
        enabledStyle,
        disabledStyle
      );
    }
  } else {
    [editBtn, deleteBtn, confirmBtn].forEach((btn) => {
      btn.disabled = true;
      btn.className = btn.className.replace(enabledStyle, disabledStyle);
    });
  }
}

function showUserForm(mode = "add", user = {}) {
  const overlay = document.getElementById("modal-overlay");
  const content = document.getElementById("modal-content");

  const isEdit = mode === "edit";

  content.innerHTML = `
    <h2 class="text-lg font-semibold mb-4">${isEdit ? "Edit" : "Add"} User</h2>
    <div class="space-y-3">
      <input id="form-name" type="text" placeholder="Full Name" value="${
        user.name || ""
      }" class="w-full px-3 py-2 rounded border border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100" />
      <input id="form-username" type="text" placeholder="Username" value="${
        user.username || ""
      }" class="w-full px-3 py-2 rounded border border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100" />
      <input id="form-email" type="email" placeholder="Email" value="${
        user.email || ""
      }" class="w-full px-3 py-2 rounded border border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100" />
      <select id="form-role" class="w-full px-3 py-2 rounded border border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        ${getAvailableLevels()
          .map(
            (level) =>
              `<option value="${level.id}" ${
                user.level === level.value ? "selected" : ""
              }>${level.text}</option>`
          )
          .join("")}
        </select>

    </div>
    <div class="flex justify-end mt-5 gap-2">
      <button id="cancel-user-form" class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500">Cancel</button>
      <button id="submit-user-form" class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500">${
        isEdit ? "Update" : "Save"
      }</button>
    </div>
  `;

  overlay.classList.remove("hidden");

  document.getElementById("cancel-user-form").addEventListener("click", () => {
    overlay.classList.add("hidden");
  });

  document
    .getElementById("submit-user-form")
    .addEventListener("click", async () => {
      const name = document.getElementById("form-name").value.trim();
      const username = document.getElementById("form-username").value.trim();
      const email = document.getElementById("form-email").value.trim();
      const level = parseInt(document.getElementById("form-role").value);

      if (!name || !username || !email || isNaN(level)) {
        showToast("All fields are required", "warning");
        return;
      }

      const payload = { name, username, email, level };
      let result;

      if (isEdit) {
        result = await supabase.from("users").update(payload).eq("id", user.id);
      } else {
        result = await supabase
          .from("users")
          .insert({ ...payload, is_registered: false, is_hold: false });
      }

      if (result.error) {
        showToast(result.error.message, "error");
      } else {
        showToast(`${isEdit ? "updated" : "created"} successfully`, "success");
        overlay.classList.add("hidden");
        await renderUserGrid();
      }
    });
}

// 🚀 Load grid
renderUserGrid();
