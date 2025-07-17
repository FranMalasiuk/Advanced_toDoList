// scripts.js

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const searchInput = document.querySelector("#search-input");
const eraseBtn = document.querySelector("#erase-btn");
const filterBtn = document.querySelector("#filter-select");
const taskCounter = document.querySelector("#task-counter");
const themeToggle = document.querySelector("#theme-toggle");

let editingTodoId = null; // Armazena o ID da tarefa que está sendo editada

// Funções auxiliares
const updateTaskCounter = () => {
  const todos = document.querySelectorAll(".todo");
  const done = document.querySelectorAll(".todo.done");
  taskCounter.innerText = `${todos.length} tasks - ${done.length} done`;
};

const saveTodo = (text, done = 0, save = 1, id = null) => {
  // Gera um ID único se não for fornecido (para novas tarefas)
  const todoId = id || crypto.randomUUID(); // Usando crypto.randomUUID() para IDs únicos

  const todo = document.createElement("div");
  todo.classList.add("todo");
  todo.setAttribute("data-id", todoId);

  const todoTitle = document.createElement("h3");
  todoTitle.innerText = text;
  todo.appendChild(todoTitle);

  const doneBtn = document.createElement("button");
  doneBtn.classList.add("finish-todo");
  doneBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
  todo.appendChild(doneBtn);

  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-todo");
  editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  todo.appendChild(editBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("remove-todo");
  deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  todo.appendChild(deleteBtn);

  if (done) todo.classList.add("done");
  if (save) saveTodoLocalStorage({ id: todoId, text, done });

  todoList.appendChild(todo);
  todoInput.value = "";
  todoInput.focus();
  updateTaskCounter();
};

const toggleForms = () => {
  editForm.classList.toggle("hide");
  todoForm.classList.toggle("hide");
  todoList.classList.toggle("hide");
};

const updateTodo = (newText, todoId) => {
  const todos = document.querySelectorAll(".todo");
  todos.forEach((todo) => {
    if (todo.getAttribute("data-id") === todoId) {
      let todoTitle = todo.querySelector("h3");
      todoTitle.innerText = newText;
      updateTodoLocalStorage(todoId, newText);
    }
  });
};

const getSearchTodos = (search) => {
  const todos = document.querySelectorAll(".todo");
  todos.forEach((todo) => {
    let todoTitle = todo.querySelector("h3").innerText.toLowerCase();
    const normalizedSearch = search.toLowerCase();
    todo.style.display = todoTitle.includes(normalizedSearch) ? "flex" : "none";
  });
};

const filterTodos = (filterValue) => {
  const todos = document.querySelectorAll(".todo");
  todos.forEach((todo) => {
    switch (filterValue) {
      case "all":
        todo.style.display = "flex";
        break;
      case "done":
        todo.style.display = todo.classList.contains("done") ? "flex" : "none";
        break;
      case "todo":
        todo.style.display = !todo.classList.contains("done") ? "flex" : "none";
        break;
    }
  });
};

// Eventos
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputValue = todoInput.value.trim();
  if (inputValue) {
    // Se desejar evitar tarefas com o mesmo texto, mantenha esta verificação
    // Caso contrário, remova-a para permitir tarefas com textos repetidos
    const exists = getTodosLocalStorage().some((todo) => todo.text === inputValue);
    if (exists) return alert("Essa tarefa já existe!");
    saveTodo(inputValue);
  }
});

document.addEventListener("click", (e) => {
  const targetEl = e.target;
  const parentEl = targetEl.closest(".todo");
  let todoId = null;

  if (parentEl) {
    todoId = parentEl.getAttribute("data-id");
  }

  if (targetEl.classList.contains("finish-todo") || targetEl.closest(".finish-todo")) {
    if (parentEl) {
      parentEl.classList.toggle("done");
      updateTodoStatusLocalStorage(todoId);
    }
  }

  if (targetEl.classList.contains("remove-todo") || targetEl.closest(".remove-todo")) {
    if (parentEl) {
      parentEl.remove();
      removeTodoLocalStorage(todoId);
    }
  }

  if (targetEl.classList.contains("edit-todo") || targetEl.closest(".edit-todo")) {
    toggleForms();
    const todoTitle = parentEl.querySelector("h3").innerText;
    editInput.value = todoTitle;
    editingTodoId = todoId; // Armazena o ID da tarefa que está sendo editada
  }
  updateTaskCounter();
});

cancelEditBtn.addEventListener("click", (e) => {
  e.preventDefault();
  toggleForms();
  editingTodoId = null; // Limpa o ID da tarefa em edição
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const editInputValue = editInput.value.trim();
  if (editInputValue && editingTodoId) {
    updateTodo(editInputValue, editingTodoId);
  }
  toggleForms();
  editingTodoId = null; // Limpa o ID da tarefa em edição
});

searchInput.addEventListener("keyup", (e) => {
  const search = e.target.value;
  getSearchTodos(search);
});

eraseBtn.addEventListener("click", (e) => {
  e.preventDefault();
  searchInput.value = "";
  searchInput.dispatchEvent(new Event("keyup"));
});

filterBtn.addEventListener("change", (e) => {
  const filterValue = e.target.value;
  filterTodos(filterValue);
});

// Local Storage
const getTodosLocalStorage = () => {
  return JSON.parse(localStorage.getItem("todos")) || [];
};

const loadTodos = () => {
  const todos = getTodosLocalStorage();
  todos.forEach((todo) => {
    saveTodo(todo.text, todo.done, 0, todo.id);
  });
};

const saveTodoLocalStorage = (todo) => {
  const todos = getTodosLocalStorage();
  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos));
};

const removeTodoLocalStorage = (todoId) => {
  const todos = getTodosLocalStorage();
  const filteredTodos = todos.filter((todo) => todo.id !== todoId); // Comparação estrita
  localStorage.setItem("todos", JSON.stringify(filteredTodos));
};

const updateTodoStatusLocalStorage = (todoId) => {
  const todos = getTodosLocalStorage();
  todos.forEach((todo) => {
    if (todo.id === todoId) {
      todo.done = !todo.done;
    }
  });
  localStorage.setItem("todos", JSON.stringify(todos));
};

const updateTodoLocalStorage = (todoId, todoNewText) => {
  const todos = getTodosLocalStorage();
  todos.forEach((todo) => {
    if (todo.id === todoId) {
      todo.text = todoNewText;
    }
  });
  localStorage.setItem("todos", JSON.stringify(todos));
};

// Modo escuro persistente
const darkMode = localStorage.getItem("darkMode") === "true";
if (darkMode) document.body.classList.add("dark-mode");
themeToggle.innerHTML = darkMode
  ? '<i class="fa-solid fa-sun"></i>'
  : '<i class="fa-solid fa-moon"></i>';

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  themeToggle.innerHTML = isDark
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
  localStorage.setItem("darkMode", isDark);
});

// Drag and drop ordenação com persistência
new Sortable(todoList, {
  animation: 150,
  onEnd: () => {
    const newOrder = [];
    document.querySelectorAll(".todo").forEach((todoEl) => {
      const id = todoEl.getAttribute("data-id");
      const text = todoEl.querySelector("h3").innerText;
      const done = todoEl.classList.contains("done") ? 1 : 0;
      newOrder.push({ id, text, done });
    });
    localStorage.setItem("todos", JSON.stringify(newOrder));
  },
});

loadTodos();
updateTaskCounter();
