// Seletores
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const searchInput = document.querySelector("#search-input");
const filterSelect = document.querySelector("#filter-select");
const themeToggle = document.querySelector("#theme-toggle");

let oldInputValue;
let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Função para salvar no localStorage
function saveToLocalStorage() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Renderiza a lista
function renderTodos() {
    todoList.innerHTML = "";

    todos.forEach((todo) => {
        const div = document.createElement("div");
        div.classList.add("todo");
        if (todo.done) div.classList.add("done");
        div.setAttribute("draggable", "true");
        div.dataset.id = todo.id;

        const title = document.createElement("h3");
        title.innerText = todo.text;
        div.appendChild(title);

        const doneBtn = document.createElement("button");
        doneBtn.classList.add("finish-todo");
        doneBtn.innerHTML = "✔";
        div.appendChild(doneBtn);

        const editBtn = document.createElement("button");
        editBtn.classList.add("edit-todo");
        editBtn.innerHTML = "✏️";
        div.appendChild(editBtn);

        const removeBtn = document.createElement("button");
        removeBtn.classList.add("remove-todo");
        removeBtn.innerHTML = "❌";
        div.appendChild(removeBtn);

        todoList.appendChild(div);
    });

    addDragAndDrop();
}

// Adiciona nova tarefa
todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;

    const exists = todos.some((t) => t.text.toLowerCase() === text.toLowerCase());
    if (exists) return alert("This task already exists!");

    const newTodo = {
        id: Date.now().toString(),
        text,
        done: false,
    };

    todos.push(newTodo);
    saveToLocalStorage();
    renderTodos();
    todoInput.value = "";
    todoInput.focus();
});

// Ações nos botões das tarefas
todoList.addEventListener("click", (e) => {
    const parent = e.target.closest(".todo");
    if (!parent) return;
    const id = parent.dataset.id;
    const todo = todos.find((t) => t.id === id);

    if (e.target.classList.contains("finish-todo")) {
        todo.done = !todo.done;
    } else if (e.target.classList.contains("remove-todo")) {
        todos = todos.filter((t) => t.id !== id);
    } else if (e.target.classList.contains("edit-todo")) {
        editForm.classList.remove("hide");
        todoForm.classList.add("hide");
        editInput.value = todo.text;
        oldInputValue = todo.text;
        editForm.dataset.id = id;
        return;
    }

    saveToLocalStorage();
    renderTodos();
});

// Cancelar edição
cancelEditBtn.addEventListener("click", () => {
    editForm.classList.add("hide");
    todoForm.classList.remove("hide");
    editInput.value = "";
});

// Confirmar edição
editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = editForm.dataset.id;
    const newText = editInput.value.trim();
    if (!newText) return;

    const exists = todos.some((t) => t.text.toLowerCase() === newText.toLowerCase() && t.id !== id);
    if (exists) return alert("This task already exists!");

    const todo = todos.find((t) => t.id === id);
    todo.text = newText;

    editForm.classList.add("hide");
    todoForm.classList.remove("hide");
    editInput.value = "";

    saveToLocalStorage();
    renderTodos();
});

// Filtro
filterSelect.addEventListener("change", () => {
    const value = filterSelect.value;
    const tasks = document.querySelectorAll(".todo");

    tasks.forEach((task) => {
        const isDone = task.classList.contains("done");
        task.style.display =
            value === "all" ||
                (value === "done" && isDone) ||
                (value === "todo" && !isDone)
                ? "flex"
                : "none";
    });
});

// Busca
searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const tasks = document.querySelectorAll(".todo");

    tasks.forEach((task) => {
        const title = task.querySelector("h3").innerText.toLowerCase();
        task.style.display = title.includes(term) ? "flex" : "none";
    });
});

// Tema escuro/claro
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    themeToggle.textContent = isDark ? "🌙 Dark Mode" : "🌞 Light Mode";
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Carregar tema salvo
(function loadTheme() {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "🌙 Dark Mode";
    }
})();

// Drag and Drop
function addDragAndDrop() {
    let draggingEl = null;

    document.querySelectorAll(".todo").forEach((el) => {
        el.addEventListener("dragstart", () => draggingEl = el);
        el.addEventListener("dragover", (e) => e.preventDefault());
        el.addEventListener("drop", (e) => {
            e.preventDefault();
            if (draggingEl && draggingEl !== el) {
                const draggingId = draggingEl.dataset.id;
                const targetId = el.dataset.id;

                const draggingIndex = todos.findIndex((t) => t.id === draggingId);
                const targetIndex = todos.findIndex((t) => t.id === targetId);

                const [removed] = todos.splice(draggingIndex, 1);
                todos.splice(targetIndex, 0, removed);

                saveToLocalStorage();
                renderTodos();
            }
        });
    });
}

// Inicializa
renderTodos();
