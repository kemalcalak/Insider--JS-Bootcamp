let tasks = [];
let nextId = 1;

function loadTasksFromStorage() {
  try {
    const storedTasks = localStorage.getItem("tasks");
    const storedNextId = localStorage.getItem("nextId");

    if (storedTasks) {
      tasks = JSON.parse(storedTasks);
    }

    if (storedNextId) {
      nextId = parseInt(storedNextId);
    }
  } catch (error) {
    console.error("Görevler yüklenirken hata:", error);
    tasks = [];
    nextId = 1;
  }
}

function saveTasksToStorage() {
  try {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("nextId", nextId.toString());
  } catch (error) {
    console.error("Görevler kaydedilirken hata:", error);
  }
}

document.getElementById("taskForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const priority = document.getElementById("taskPriority").value;
  const category = document.getElementById("taskCategory").value;
  const completed = document.getElementById("taskCompleted").checked;

  if (!title) {
    showError("Görev başlığı zorunludur!");
    return;
  }

  const newTask = {
    id: nextId++,
    title: title,
    description: description,
    priority: priority,
    category: category,
    completed: completed,
    createdAt: new Date().toLocaleString("tr-TR"),
  };

  tasks.push(newTask);
  saveTasksToStorage();
  clearForm();
  hideError();
  renderTasks();
});

function showError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

function hideError() {
  document.getElementById("errorMessage").style.display = "none";
}

function clearForm() {
  document.getElementById("taskForm").reset();
  document.getElementById("taskPriority").value = "low";
  document.getElementById("taskCategory").value = "genel";
}

function clearAllTasks() {
  if (
    confirm(
      "Tüm görevleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!"
    )
  ) {
    tasks = [];
    nextId = 1;
    saveTasksToStorage();
    renderTasks();
  }
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasksToStorage();
    renderTasks();
  }
}

function deleteTask(id) {
  if (confirm("Bu görevi silmek istediğinizden emin misiniz?")) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasksToStorage();
    renderTasks();
  }
}

function filterTasks() {
  const completedFilter = document.getElementById("filterCompleted").value;
  const priorityFilter = document.getElementById("filterPriority").value;
  const categoryFilter = document.getElementById("filterCategory").value;
  const sortBy = document.getElementById("sortBy").value;

  let filtered = tasks.filter((task) => {
    const completedMatch =
      completedFilter === "all" ||
      (completedFilter === "completed" && task.completed) ||
      (completedFilter === "pending" && !task.completed);

    const priorityMatch =
      priorityFilter === "all" || task.priority === priorityFilter;
    const categoryMatch =
      categoryFilter === "all" || task.category === categoryFilter;

    return completedMatch && priorityMatch && categoryMatch;
  });

  filtered.sort((a, b) => {
    switch (sortBy) {
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case "title":
        return a.title.localeCompare(b.title, "tr");
      case "created":
      default:
        return b.id - a.id;
    }
  });

  return filtered;
}

function renderTasks() {
  const tasksList = document.getElementById("tasksList");
  const filteredTasks = filterTasks();

  if (filteredTasks.length === 0) {
    tasksList.innerHTML =
      '<div class="empty-state">Henüz görev bulunmamaktadır.</div>';
    return;
  }

  tasksList.innerHTML = filteredTasks
    .map(
      (task) => `
                <div class="task-item ${
                  task.completed ? "completed" : ""
                } priority-${task.priority}">
                    <div class="task-header">
                        <div class="task-title ${
                          task.completed ? "completed" : ""
                        }">${task.title}</div>
                        <div class="task-actions">
                            <button class="btn" onclick="toggleTask(${
                              task.id
                            })">
                                ${task.completed ? "↩ Geri Al" : "✓ Tamamla"}
                            </button>
                            <button class="btn btn-danger" onclick="deleteTask(${
                              task.id
                            })">🗑 Sil</button>
                        </div>
                    </div>
                    ${
                      task.description
                        ? `<div style="margin-bottom: 10px; color: #666;">${task.description}</div>`
                        : ""
                    }
                    <div class="task-details">
                        <div class="task-detail">
                            <span class="priority-badge priority-${
                              task.priority
                            }">${getPriorityText(task.priority)}</span>
                        </div>
                        <div class="task-detail">${getCategoryText(
                          task.category
                        )}</div>
                        <div class="task-detail">${task.createdAt}</div>
                    </div>
                </div>
            `
    )
    .join("");
}

function getPriorityText(priority) {
  switch (priority) {
    case "high":
      return "Yüksek";
    case "medium":
      return "Orta";
    case "low":
      return "Düşük";
    default:
      return priority;
  }
}

function getCategoryText(category) {
  switch (category) {
    case "genel":
      return "Genel";
    case "is":
      return "İş";
    case "kisisel":
      return "Kişisel";
    case "egitim":
      return "Eğitim";
    case "saglik":
      return "Sağlık";
    default:
      return category;
  }
}

document
  .getElementById("filterCompleted")
  .addEventListener("change", renderTasks);
document
  .getElementById("filterPriority")
  .addEventListener("change", renderTasks);
document
  .getElementById("filterCategory")
  .addEventListener("change", renderTasks);
document.getElementById("sortBy").addEventListener("change", renderTasks);

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("task-checkbox")) {
    const taskId = parseInt(e.target.dataset.id);
    toggleTask(taskId);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  loadTasksFromStorage();
  renderTasks();
});

loadTasksFromStorage();
renderTasks();
