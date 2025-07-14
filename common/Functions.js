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
    { level: 1, name: "Admin" },
    { level: 2, name: "Teacher" },
    { level: 3, name: "Student" },
  ];
}
