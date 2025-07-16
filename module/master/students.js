import {
  calculateAge,
  formatDateMDY,
  showToast,
} from "../../common/Functions.js";
import { supabase } from "./../../supabaseClient.js";
import { Grid, html } from "https://unpkg.com/gridjs?module";
import flatpickr from "https://esm.sh/flatpickr";
import Papa from "https://esm.sh/papaparse@5.4.1";

let selectedStudent = null;
const addStudent = document.getElementById("btn-add");
const cancelAdd = document.getElementById("btn-add-cancel");
const confirmAdd = document.getElementById("btn-add-confirm");
const formContainer = document.getElementById("student-form");
const gridContainer = document.getElementById("student-grid");
const btnForm = document.getElementById("btn-form");
const btnOptions = document.getElementById("btn-options");
const btnEdit = document.getElementById("btn-edit");
const bday = document.getElementById("bday");
const btnUpload = document.getElementById("btn-upload");
const csvModal = document.getElementById("csvModal");
const csvFileInput = document.getElementById("csvFile");
const cancelCsvUpload = document.getElementById("cancelCsvUpload");
const submitCsvUpload = document.getElementById("submitCsvUpload");
const csvPreviewContainer = document.getElementById("csvPreviewContainer");
const csvTableHead = document.getElementById("csvTableHead");
const csvTableBody = document.getElementById("csvTableBody");

const todayMinus3Years = new Date();
todayMinus3Years.setFullYear(todayMinus3Years.getFullYear() - 3);

// Initialize Flatpickr
flatpickr(bday, {
  dateFormat: "Y-m-d",
  altInput: true,
  altFormat: "F j, Y",
  allowInput: true,
  clickOpens: true,
  maxDate: todayMinus3Years, // 👈 limits to 3 years ago and older
});
async function loadStudents() {
  const { data, error } = await supabase.from("students").select("*");

  if (error) {
    console.error("Supabase fetch error:", error.message);
    return;
  }
  new Grid({
    columns: [
      { name: "LRN", sort: true },
      { name: "Name", sort: true },
      { name: "Average", sort: true },
      { name: "Sex", sort: true },
      { name: "Age", sort: true },
      { name: "Guardian", sort: false },
      { name: "Contact", sort: false },
      { name: "Address", sort: false },
      { name: "Brgy", sort: false },
      { name: "Birthday", sort: false },
      { name: "FB Name", sort: false },
      { name: "FB Link", sort: false },
      { name: "Previous Adviser", sort: false },
    ],
    data: data.map((s) => [
      s.lrn ?? "—",
      s.name ?? "-",
      s.avg ?? "—",
      s.sex ?? "—",
      s.age ?? "—",
      s.guardian ?? "—",
      s.contact ?? "—",
      s.address ?? "—",
      s.brgy ?? "—",
      formatDateMDY(s.bday) ?? "—",
      s.fb_name ?? "—",
      s.fb_link ?? "—",
      s.prev_adviser ?? "—",
    ]),
    pagination: {
      limit: 10,
    },
    search: true,
    sort: true,
    className: {
      container: "text-white rounded-lg shadow-lg border border-gray-800",
      table:
        "w-full text-sm bg-gray-900 text-white border border-gray-800 rounded border-collapse",
      thead: "bg-gray-800",
      th: "px-2 py-1 text-gray-200 font-semibold border border-gray-700",
      td: "px-3 py-1 border border-gray-700 text-gray-100",
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
      selectedStudent = null;
    } else {
      selectedStudent = data[index];
      row.classList.add("bg-indigo-100", "dark:bg-gray-700");
    }
    console.log("Selected student:", selectedStudent);
  });
}

addStudent?.addEventListener("click", () => {
  gridContainer.classList.add("hidden");
  formContainer.classList.remove("hidden");
  btnOptions.classList.add("hidden");
  btnForm.classList.remove("hidden");
  setTimeout(() => document.getElementById("add-lastname")?.focus(), 100);
});

cancelAdd?.addEventListener("click", () => {
  btnOptions.classList.remove("hidden");
  formContainer.classList.add("hidden");
  gridContainer.classList.remove("hidden");
  btnForm.classList.add("hidden");
  confirmAdd.innerText = "Save";
});

confirmAdd?.addEventListener("click", async () => {
  const last = document.getElementById("lastname").value.trim();
  const first = document.getElementById("firstname").value.trim();
  const middle = document.getElementById("middlename").value.trim();
  const name = `${last}, ${first} ${middle}`.trim();
  const student = {
    name: name,
    lrn: document.getElementById("lrn").value.trim(),
    avg: parseFloat(document.getElementById("avg").value),
    age: parseInt(document.getElementById("age").value, 10),
    bday: document.getElementById("bday").value,
    sex: document.getElementById("sex").value,
    address: document.getElementById("address").value.trim(),
    brgy: document.getElementById("brgy").value.trim(),
    guardian: document.getElementById("guardian").value.trim(),
    contact: document.getElementById("contact").value.trim(),
    fb_name: document.getElementById("fbname").value.trim(),
    fb_link: document.getElementById("fblink").value.trim(),
    prev_adviser: document.getElementById("prevadviser").value.trim(),
  };

  if (!student.name || !student.lrn || isNaN(student.age)) {
    showToast("Please complete required fields.", "error");
    return;
  }

  let error, response;

  if (selectedStudent?.id) {
    // Update existing student
    ({ error, data: response } = await supabase
      .from("students")
      .update(student)
      .eq("id", selectedStudent.id));
  } else {
    // Insert new student
    ({ error, data: response } = await supabase
      .from("students")
      .insert([student]));
  }

  if (error) {
    showToast(
      `❌ Failed to ${selectedStudent ? "update" : "add"} student: ${
        error.message
      }`,
      "error"
    );
  } else {
    showToast(
      `✅ Student ${selectedStudent ? "updated" : "added"}!`,
      "success"
    );
    selectedStudent = null;
    cancelAdd.click();
    await loadStudents();
  }
});

// Trigger Edit modal
btnEdit?.addEventListener("click", () => {
  if (!selectedStudent) {
    showToast("Please select a student row to edit.", "error");
    return;
  }

  gridContainer.classList.add("hidden");
  formContainer.classList.remove("hidden");
  btnOptions.classList.add("hidden");
  btnForm.classList.remove("hidden");
  confirmAdd.innerText = "Update";

  const fullName = selectedStudent.name ?? "";
  const [last, rest] = fullName.split(",", 2); // Separate at comma
  const [first, ...middle] = rest.trim().split(" "); // Split remaining part
  const middleName = middle.join(" ");

  document.getElementById("lastname").value = last?.trim() ?? "";
  document.getElementById("firstname").value = first?.trim() ?? "";
  document.getElementById("middlename").value = middleName?.trim() ?? "";
  document.getElementById("lrn").value = selectedStudent.lrn ?? "";
  document.getElementById("avg").value = selectedStudent.avg ?? "";
  document.getElementById("age").value = selectedStudent.age ?? "";
  document.getElementById("bday").value = selectedStudent.bday ?? "";
  document.getElementById("sex").value = selectedStudent.sex ?? "";
  document.getElementById("address").value = selectedStudent.address ?? "";
  document.getElementById("brgy").value = selectedStudent.brgy ?? "";
  document.getElementById("guardian").value = selectedStudent.guardian ?? "";
  document.getElementById("contact").value = selectedStudent.contact ?? "";
  document.getElementById("fbname").value = selectedStudent.fb_name ?? "";
  document.getElementById("fblink").value = selectedStudent.fb_link ?? "";
  document.getElementById("prevadviser").value =
    selectedStudent.prev_adviser ?? "";
});

document.getElementById("bday")?.addEventListener("change", (e) => {
  const age = calculateAge(e.target.value);
  if (age !== null && !isNaN(age)) {
    document.getElementById("age").value = age;
  } else {
    document.getElementById("age").value = "";
  }
});

let parsedStudents = [];

btnUpload.addEventListener("click", () => {
  csvModal.classList.remove("hidden");
});

cancelCsvUpload.addEventListener("click", () => {
  resetModal();
});

csvFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (!results.data.length) {
        showToast("CSV is empty or invalid", "error");
        return;
      }

      parsedStudents = results.data.map((student) => {
        const age = calculateAge(student.birthday);
        return {
          ...student,
          age: isNaN(age) ? null : age,
        };
      });

      renderPreview(parsedStudents);
    },
    error: (err) => {
      console.error(err);
      showToast("Failed to parse CSV", "error");
    },
  });
});
// Submit data to Supabase (Upsert on LRN)
submitCsvUpload.addEventListener("click", async () => {
  if (!parsedStudents.length) {
    showToast("No valid student data to upload", "error");
    return;
  }

  const { error } = await supabase
    .from("students")
    .upsert(parsedStudents, { onConflict: ["lrn"] });

  if (error) {
    console.error(error);
    showToast("Error uploading students", "error");
  } else {
    showToast("Students uploaded successfully!", "success");
    resetModal();
    loadStudents();
  }
});

// Helpers
function resetModal() {
  csvModal.classList.add("hidden");
  csvFileInput.value = "";
  csvPreviewContainer.classList.add("hidden");
  csvTableHead.innerHTML = "";
  csvTableBody.innerHTML = "";
  parsedStudents = [];
}

function renderPreview(data) {
  if (!data.length) return;

  // Header
  const headers = Object.keys(data[0]);
  csvTableHead.innerHTML = `<tr>${headers
    .map((h) => `<th class="px-3 py-2 text-left">${h}</th>`)
    .join("")}</tr>`;

  // Body
  csvTableBody.innerHTML = data
    .map(
      (row) => `
    <tr>${headers
      .map((h) => `<td class="px-3 py-1">${row[h] ?? ""}</td>`)
      .join("")}</tr>
  `
    )
    .join("");

  csvPreviewContainer.classList.remove("hidden");
}

loadStudents();
