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
