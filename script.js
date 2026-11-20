const taskList = document.getElementById("taskList");
const newBtn = document.getElementById("newBtn");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const titleInput = document.getElementById("titleInput");
const noteInput = document.getElementById("noteInput");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const emptyMsg = document.getElementById("emptyMsg");
const searchInput = document.getElementById("searchInput");
const refreshBtn = document.getElementById("refreshBtn");
const clock = document.getElementById("clock");


let tasks = loadTasks();
let editingId = null;
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem("tasks")) || [];
  } catch (error) {
    return [];
  }
}
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
function today() {
  const opts = { month: "short", day: "numeric" };
  opts.year = "numeric";
  return new Date().toLocaleDateString("en-US", opts);
}

function matches(t, term) {
  const text = (t.title + " " + t.note).toLowerCase();
  return text.includes(term);
}
function render() {
  const term = searchInput.value.trim().toLowerCase();
  const visible = tasks
    .filter(t => matches(t, term))
    .sort((a, b) => b.pinned - a.pinned);
  taskList.innerHTML = "";
  emptyMsg.classList.toggle("hidden", visible.length > 0);
  visible.forEach(t => {
    const pin = t.pinned ? "&#128204;" : "";
    const pinLabel = t.pinned ? "Unpin" : "Pin";
    const checked = t.done ? "checked" : "";
    const li = document.createElement("li");
    li.className = "card" + (t.done ? " done" : "");
    li.dataset.id = t.id;
    li.innerHTML = `
      <div class="info">
        <span class="pin">${pin}</span>
        <h3 class="t-title"></h3>
        <p class="t-note"></p>
        <small>${t.date}</small>
      </div>
      <div class="actions">
        <button class="menu-btn">&#8942;</button>
        <input type="checkbox" class="check" ${checked}>
      </div>
      <div class="menu hidden">
        <button data-action="edit">Edit</button>
        <button data-action="pin">${pinLabel}</button>
        <button data-action="delete">Delete</button>
      </div>`;
    // textContent keeps typed text safe
    li.querySelector(".t-title").textContent = t.title;
    li.querySelector(".t-note").textContent = t.note;
    taskList.appendChild(li);
  });
  }


  function toggleDone(id) {
  const t = tasks.find(x => x.id === id);
  t.done = !t.done;
  saveTasks();
  render();
}
function togglePin(id) {
  const t = tasks.find(x => x.id === id);
  t.pinned = !t.pinned;
  saveTasks();
  render();
}
function deleteTask(id) {
  tasks = tasks.filter(x => x.id !== id);
  saveTasks();
  render();
}

function openModal(id = null) {
  editingId = id;
  const t = tasks.find(x => x.id === id);
  modalTitle.textContent = t ? "Edit Task" : "New Task";
  titleInput.value = t ? t.title : "";
  noteInput.value = t ? t.note : "";
  modal.classList.remove("hidden");
  titleInput.focus();
}
function closeModal() {
  modal.classList.add("hidden");
  editingId = null;
}
function saveTask() {
  const title = titleInput.value.trim();
  const note = noteInput.value.trim();
  if (title === "") {
    titleInput.focus();
    return;
  }
  if (editingId !== null) {
    const t = tasks.find(x => x.id === editingId);
    t.title = title;
    t.note = note;
  } else {
    tasks.push({
      id: Date.now(),
      title: title,
      note: note,
      date: today(),
      done: false,
      pinned: false
    });
  }
  saveTasks();
  closeModal();
  render();
}

newBtn.addEventListener("click", () => openModal());
saveBtn.addEventListener("click", saveTask);
cancelBtn.addEventListener("click", closeModal);
searchInput.addEventListener("input", render);
refreshBtn.addEventListener("click", () => {
  searchInput.value = "";
  tasks = loadTasks();
  render();
});
taskList.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
    if (!card) return;

    const id = Number(card.dataset.id);

    // Three-dot button
    if (e.target.closest(".menu-btn")) {
        card.querySelector(".menu").classList.toggle("hidden");
        return;
    }

    // Checkbox
    if (e.target.classList.contains("check")) {
        toggleDone(id);
        return;
    }

    // Menu actions
    const actionButton = e.target.closest("[data-action]");
    if (!actionButton) return;

    const action = actionButton.dataset.action;

    if (action === "edit") {
        openModal(id);
    }

    else if (action === "pin") {
        togglePin(id);
    }

    else if (action === "delete") {
        deleteTask(id);
    }

});

  function updateClock() {
  const now = new Date();
  const hours = now.getHours() % 12 || 12;
  const mins = String(now.getMinutes()).padStart(2, "0");
  clock.textContent = hours + ":" + mins;
}
updateClock();
setInterval(updateClock, 1000);
render();