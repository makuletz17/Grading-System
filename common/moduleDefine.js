import { supabase } from "../supabaseClient.js";
import {
  w2layout,
  w2alert,
  w2grid,
  w2form,
  w2ui,
  w2tabs,
} from "https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js";
import { getAvailableLevels, getLevelName } from "./Functions.js";

const gridWrapper = document.getElementById("w2ui-grid");

let config = {
  tabLayout: {
    name: "tabLayout",
    panels: [
      {
        type: "top",
        overflow: "hidden",
        resizable: true,
        hidden: false,
        size: "30",
      },
      {
        type: "main",
        overflow: "hidden",
        resizable: true,
        hidden: false,
      },
      {
        type: "left",
        overflow: "hidden",
        resizable: true,
        hidden: true,
        size: "30%",
      },
    ],
  },
  moduleForm: {
    name: "moduleForm",
    header: "PROGRAM MODULE DEFINITION",
    formURL: "../common/page/moduleDefine.html",
    focus: "mname",
    fields: [
      { field: "mname", type: "text", required: true },
      { field: "pname", type: "text", required: true },
      { field: "folder", type: "text", required: true },
      {
        field: "level",
        type: "list",
        required: true,
        options: { items: [] },
      },
      {
        field: "iparent",
        type: "list",
        required: true,
        options: { items: [] },
      },
    ],
    actions: {
      clear: function () {
        moduleForm.clear();
      },
      save: function () {
        if (moduleForm.validate().length === 0) {
          saveRecord(moduleForm.record);
        }
      },
      back: function () {
        tabLayout.hide("left");
        tabLayout.unlock("main");
      },
    },
  },
  tabs: {
    name: "tabs",
    tabs: [],
    onClick: function (event) {
      getModules(event.target);
    },
  },
  grid: {
    name: "grid",
    multiSearch: false,
    multiSelect: false,
    show: {
      toolbar: true,
      lineNumbers: true,
      footer: true,
      toolbarAdd: true,
      toolbarEdit: true,
      toolbarReload: false,
      toolbarSearch: false,
    },
    searches: [
      { field: "mname", text: "MENU NAME", type: "text" },
      { field: "pname", text: "PROGRAM NAME", type: "text" },
      { field: "parent", text: "SYSTEM NAME", type: "text" },
    ],
    columns: [
      { field: "mname", text: "MENU NAME", size: "150px" },
      { field: "pname", text: "PROGRAM NAME", size: "250px" },
      { field: "folder", text: "PROGRAM FOLDER", size: "300px" },
      { field: "group", text: "GROUP", size: "200px" },
      { field: "active", text: "ACTIVE", size: "90px", attr: "align=center" },
      { field: "level", text: "MINIMUM LEVEL", size: "200px" },
    ],
    onAdd: function (event) {
      newModule();
    },
    onEdit: function (event) {
      if (grid.getSelection().length > 0) {
        const record = grid.get(grid.getSelection()[0]);
        editModule(record);
      } else {
        w2alert("Please select user to edit!");
      }
    },
    toolbar: {
      items: [
        { type: "spacer" },
        { type: "break" },
        { type: "button", id: "hold", text: "SET MODULE ACTIVE/INACTIVE" },
      ],
      onClick: function (event) {
        switch (event.target) {
          case "hold":
            if (grid.getSelection().length > 0) {
              set_module(grid.getSelection()[0]);
            } else {
              w2alert("Please select user to confirm registration!");
            }
            break;
        }
      },
    },
  },
};

let tabLayout = new w2layout(config.tabLayout);
let grid = new w2grid(config.grid);
let moduleForm = new w2form(config.moduleForm);
let tabs = new w2tabs(config.tabs);

(async () => {
  if (tabLayout) tabLayout.destroy();
  if (tabs) tabs.destroy();
  if (moduleForm) moduleForm.destroy();
  if (grid) grid.destroy();
  adjustGridHeight();

  tabLayout.render(gridWrapper);
  await getTabs();
})();

window.addEventListener("resize", adjustGridHeight);

async function getTabs() {
  const loading = document.getElementById("loading-indicator");

  loading.classList.remove("hidden");

  const { data, error } = await supabase.from("program_parent").select("*");

  if (error || !data || data.length === 0) {
    loading.innerHTML = `<span class='text-red-600'>No modules available.</span>`;
    return;
  }
  const savedModule = localStorage.getItem("activeModuleTab");

  config.programParent = data.map((program, index) => ({
    id: program.id,
    text: program.parent_name || `Module ${index + 1}`,
  }));

  tabs.tabs = config.programParent;
  tabs.active = savedModule !== "" ? savedModule : config.programParent[0].id;
  tabLayout.html("top", tabs);
  tabLayout.html("main", grid);
  tabs.refresh();
  grid.refresh();
  await getModules(tabs.active);
  loading.classList.add("hidden");
}

function adjustGridHeight() {
  const h = window.innerHeight - 170;
  gridWrapper.style.height = `${h}px`;
}

const getModules = async (parentId) => {
  localStorage.setItem("activeModuleTab", parentId);

  const { data, error } = await supabase
    .from("program")
    .select("*")
    .eq("parent_id", parentId);

  if (error || !data || data.length === 0) {
    grid.clear();
    grid.message = [];
    return;
  }

  const records = data.map((program) => ({
    recid: program.id,
    mname: program.menu_name,
    pname: program.program_name,
    folder: program.program_folder,
    active: program.is_active ? "✅" : "❌",
    level: getLevelName(program.level),
    iparent: program.parent_id,
  }));

  grid.clear();
  grid.add(records);
};

function editModule(record) {
  if (moduleForm) {
    moduleForm.destroy();
  }
  tabLayout.html("left", moduleForm);
  moduleForm.fields[3].options.items = getAvailableLevels();
  moduleForm.fields[4].options.items = config.programParent;
  moduleForm.record = record;
  setTimeout(() => {
    tabLayout.show("left");
    tabLayout.lock("main");
    tabLayout.refresh("left", moduleForm);
  }, 100);
}
