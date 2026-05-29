// =============================================================================
// MODEL
// Pure functions and localStorage I/O. No DOM access in this layer.
// =============================================================================

/**
 * Creates a new Task object.
 * @param {string} description - The task description (should be pre-validated).
 * @returns {{ id: string, description: string, completed: boolean, createdAt: number }}
 */
const createTask = (description) => ({
  id: crypto.randomUUID(),
  description: description.trim(),
  completed: false,
  createdAt: Date.now(),
});

/**
 * Validates a task description.
 * @param {string} description
 * @returns {{ valid: boolean, error: string|null }}
 */
const validateDescription = (description) => {
  if (typeof description !== 'string' || description.trim().length === 0) {
    return { valid: false, error: 'Task description cannot be empty.' };
  }
  if (description.trim().length > 500) {
    return { valid: false, error: 'Task description cannot exceed 500 characters.' };
  }
  return { valid: true, error: null };
};

/**
 * Adds a new task to the list after validating the description.
 * @param {Array} taskList - The current task list.
 * @param {string} description - The description for the new task.
 * @returns {Array|{ error: string }} New task list on success, or an error object on failure.
 */
const addTask = (taskList, description) => {
  const validation = validateDescription(description);
  if (!validation.valid) {
    return { error: validation.error };
  }
  const task = createTask(description);
  return [...taskList, task];
};

/**
 * Deletes a task from the list by id.
 * If the id is not found, returns the original array (no-op).
 * @param {Array} taskList - The current task list.
 * @param {string} id - The id of the task to remove.
 * @returns {Array} New task list without the target task.
 */
const deleteTask = (taskList, id) => {
  const index = taskList.findIndex((task) => task.id === id);
  if (index === -1) return taskList;
  return taskList.filter((task) => task.id !== id);
};

/**
 * Toggles the `completed` status of a task by id.
 * If the id is not found, returns the original array (no-op).
 * @param {Array} taskList - The current task list.
 * @param {string} id - The id of the task to toggle.
 * @returns {Array} New task list with the target task's `completed` flipped.
 */
const toggleTask = (taskList, id) => {
  const index = taskList.findIndex((task) => task.id === id);
  if (index === -1) return taskList;
  return taskList.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
};

/**
 * Filters the task list by completion status.
 * @param {Array} taskList - The current task list.
 * @param {'all'|'active'|'completed'} filter - The filter to apply.
 * @returns {Array} Filtered task list.
 */
const filterTasks = (taskList, filter) => {
  switch (filter) {
    case 'active':
      return taskList.filter((task) => task.completed === false);
    case 'completed':
      return taskList.filter((task) => task.completed === true);
    case 'all':
    default:
      return [...taskList];
  }
};

/**
 * Serializes a TaskList to a JSON string.
 * @param {Array} taskList - The task list to serialize.
 * @returns {string} JSON string representation of the task list.
 */
const serialize = (taskList) => JSON.stringify(taskList);

/**
 * Deserializes a JSON string back to a TaskList.
 * Returns null on any parse failure or if the result is not an array.
 * Never throws.
 * @param {string} json - The JSON string to parse.
 * @returns {Array|null} The parsed task list, or null on failure.
 */
const deserialize = (json) => {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      console.error('Deserialization failed: parsed value is not an array.', parsed);
      return null;
    }
    return parsed;
  } catch (err) {
    console.error('Deserialization failed: invalid JSON.', err);
    return null;
  }
};

/**
 * Saves the task list to localStorage.
 * @param {Array} taskList - The task list to persist.
 * @returns {{ success: boolean }}
 */
const saveToStorage = (taskList) => {
  try {
    const json = serialize(taskList);
    localStorage.setItem('todo-list-app', json);
    return { success: true };
  } catch (err) {
    console.error('saveToStorage failed: could not write to localStorage.', err);
    return { success: false };
  }
};

/**
 * Loads the task list from localStorage.
 * Returns an empty array if the key is missing or the data cannot be parsed.
 * @returns {Array} The persisted task list, or [] on failure/missing key.
 */
const loadFromStorage = () => {
  const json = localStorage.getItem('todo-list-app');
  if (json === null) {
    return [];
  }
  const result = deserialize(json);
  return result === null ? [] : result;
};

// =============================================================================
// VIEW
// DOM rendering functions. Accept state, produce DOM mutations. No business logic.
// =============================================================================

/**
 * Renders the task list into the DOM.
 * Clears and re-renders the #task-list container based on the filtered tasks.
 * Also updates the empty-state message visibility.
 * @param {Array} taskList - The full task list (unfiltered).
 * @param {'all'|'active'|'completed'} filter - The active filter.
 */
const renderTaskList = (taskList, filter) => {
  const listEl = document.getElementById('task-list');
  const filtered = filterTasks(taskList, filter);

  // Clear existing items
  listEl.innerHTML = '';

  filtered.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    // Complete button (checkbox)
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'complete-button';
    checkbox.checked = task.completed;
    checkbox.dataset.id = task.id;
    checkbox.setAttribute('aria-label', `Mark "${task.description}" as ${task.completed ? 'incomplete' : 'complete'}`);

    // Description text
    const span = document.createElement('span');
    span.className = 'task-description';
    span.textContent = task.description;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-button';
    deleteBtn.dataset.id = task.id;
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', `Delete "${task.description}"`);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    listEl.appendChild(li);
  });

  // Show empty state if no tasks match the current filter
  const isEmpty = filtered.length === 0;
  const emptyMessage = filter === 'all'
    ? 'No tasks yet. Add one above!'
    : filter === 'active'
      ? 'No active tasks.'
      : 'No completed tasks.';
  renderEmptyState(isEmpty, emptyMessage);
};

/**
 * Renders the filter bar, highlighting the active filter button.
 * @param {'all'|'active'|'completed'} activeFilter - The currently active filter.
 */
const renderFilterBar = (activeFilter) => {
  const buttons = document.querySelectorAll('.filter-button');
  buttons.forEach((btn) => {
    if (btn.dataset.filter === activeFilter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
};

/**
 * Shows or hides the empty-state message element.
 * @param {boolean} visible - Whether to show the message.
 * @param {string} message - The message text to display.
 */
const renderEmptyState = (visible, message) => {
  const el = document.getElementById('empty-state');
  if (visible) {
    el.textContent = message;
    el.style.display = '';
  } else {
    el.textContent = '';
    el.style.display = 'none';
  }
};

/**
 * Displays an inline validation error near the Input_Field.
 * @param {string} message - The error message to display.
 */
const showInputError = (message) => {
  const el = document.getElementById('input-error');
  el.textContent = message;
};

/**
 * Clears the inline validation error near the Input_Field.
 */
const clearInputError = () => {
  const el = document.getElementById('input-error');
  el.textContent = '';
};

/**
 * Clears the Input_Field value and returns focus to it.
 */
const resetInputField = () => {
  const input = document.getElementById('Input_Field');
  input.value = '';
  input.focus();
};

// =============================================================================
// CONTROLLER
// Entry point. Wires DOM events → Model → saveToStorage → View render.
// Only runs in a browser environment (not in Node.js / test runner).
// =============================================================================

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // ── In-memory state ──────────────────────────────────────────────────────
    let taskList = loadFromStorage();
    let activeFilter = 'all';

    // ── Initial render ───────────────────────────────────────────────────────
    renderTaskList(taskList, activeFilter);
    renderFilterBar(activeFilter);

    // ── Helper: handle add-task logic (shared by Enter key and Add button) ───
    const handleAddTask = () => {
      const input = document.getElementById('Input_Field');
      const description = input.value;

      const result = addTask(taskList, description);

      if (result && result.error) {
        // Validation failed — show inline error, do not clear input
        showInputError(result.error);
        return;
      }

      // Success
      clearInputError();
      taskList = result;
      const storageResult = saveToStorage(taskList);
      if (!storageResult.success) {
        console.error('Failed to persist task list after adding task.');
      }
      renderTaskList(taskList, activeFilter);
      renderFilterBar(activeFilter);
      // Clear input and return focus within 500ms (Req 1.5)
      setTimeout(() => resetInputField(), 0);
    };

    // ── Input_Field: Enter key ───────────────────────────────────────────────
    document.getElementById('Input_Field').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleAddTask();
      }
    });

    // ── Add_Button: click ────────────────────────────────────────────────────
    document.getElementById('Add_Button').addEventListener('click', () => {
      handleAddTask();
    });

    // ── Task list: delegated click (Complete_Button and Delete_Button) ───────
    document.getElementById('task-list').addEventListener('click', (e) => {
      // Complete_Button (checkbox)
      if (e.target.classList.contains('complete-button')) {
        const id = e.target.dataset.id;
        const previousList = taskList;

        try {
          taskList = toggleTask(taskList, id);
          const storageResult = saveToStorage(taskList);
          if (!storageResult.success) {
            // Storage failed — revert in-memory state and log
            console.error('Failed to persist task list after toggling task. Reverting.');
            taskList = previousList;
          }
          renderTaskList(taskList, activeFilter);
          renderFilterBar(activeFilter);
        } catch (err) {
          // Unexpected error — revert visual state
          console.error('Toggle operation failed. Reverting.', err);
          taskList = previousList;
          renderTaskList(taskList, activeFilter);
          renderFilterBar(activeFilter);
        }
      }

      // Delete_Button
      if (e.target.classList.contains('delete-button')) {
        const id = e.target.dataset.id;
        taskList = deleteTask(taskList, id);
        const storageResult = saveToStorage(taskList);
        if (!storageResult.success) {
          console.error('Failed to persist task list after deleting task.');
        }
        renderTaskList(taskList, activeFilter);
        renderFilterBar(activeFilter);
      }
    });

    // ── Filter controls: click ───────────────────────────────────────────────
    document.getElementById('filter-bar').addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-button')) {
        activeFilter = e.target.dataset.filter;
        renderTaskList(taskList, activeFilter);
        renderFilterBar(activeFilter);
      }
    });
  });
}

// =============================================================================
// EXPORTS — Node.js / Vitest / Jest compatibility (does not affect browser use)
// =============================================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createTask,
    validateDescription,
    addTask,
    deleteTask,
    toggleTask,
    filterTasks,
    serialize,
    deserialize,
    saveToStorage,
    loadFromStorage,
  };
}
