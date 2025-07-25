export function getLevelName(level) {
  switch (level) {
    case 1:
      return "Admin";
    case 2:
      return "Teacher";
    case 3:
      return "Student";
  }
}

export function getAvailableLevels() {
  return [
    { id: 1, text: "Admin" },
    { id: 2, text: "Teacher" },
    { id: 3, text: "Student" },
  ];
}

export const getIp = async () => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const { ip } = await res.json();
    return ip || "unknown";
  } catch (err) {
    console.warn("IP fetch failed:", err);
    return "unknown";
  }
};

export function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");

  const colors = {
    info: "bg-blue-500",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    error: "bg-red-600",
  };

  toast.className = `
    px-4 py-2 rounded shadow text-white text-sm animate-fade-in 
    ${colors[type] || colors.info}
  `;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
export function calculateAge(birthday) {
  if (!birthday) return null;
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

export function formatDateMDY(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date)) return "—";

  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${mm}/${dd}/${yyyy}`;
}

export function adjustGridHeight() {
  const h = window.innerHeight - 170;
  gridWrapper.style.height = `${h}px`;
}

export function showConfirmation(message, action) {
  const overlay = document.getElementById("modal-overlay");
  const content = document.getElementById("modal-content");

  content.innerHTML = `
    <p class="mb-4">${message}</p>
    <div class="flex justify-end gap-2">
      <button id="cancel-confirm" class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500">Cancel</button>
      <button id="proceed-confirm" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500">Confirm</button>
    </div>
  `;

  overlay.classList.remove("hidden");

  document.getElementById("cancel-confirm").addEventListener("click", () => {
    overlay.classList.add("hidden");
  });

  document
    .getElementById("proceed-confirm")
    .addEventListener("click", async () => {
      overlay.classList.add("hidden");
      await action();
      await renderUserGrid();
    });
}

export function createDot() {
  const dot = document.createElement("span");
  dot.className =
    "status-dot inline-block w-2 h-2 bg-green-500 rounded-full mr-2";
  return dot;
}

export function removeDot() {
  document
    .querySelectorAll("[data-module], #load-module-define, #user-reg")
    .forEach((btn) => {
      const dot = btn.querySelector(".status-dot");
      if (dot) dot.remove();
    });
}
