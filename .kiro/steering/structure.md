# Project Structure

## File Layout

```
KiroWeb/
├── index.html        # App entry point — semantic markup, links style.css and app.js
├── style.css         # All styles (layout, task items, completed state, filter bar, empty state)
├── app.js            # All JavaScript — Model, View, and Controller layers
├── test.js           # Unit + property-based tests (Node.js / Vitest / Jest)
└── test.html         # Browser-based test runner (QUnit + fast-check via CDN, zero-install fallback)
```

> `index.html`, `style.css`, and `app.js` are the only files required to run the app.

## Architecture: MVC

`app.js` is organized into three logical layers. Keep them separated — do not mix concerns.

### Model
Pure functions and localStorage I/O. No DOM access.

| Function | Purpose |
|---|---|
| `createTask(description)` | Returns a new Task object `{ id, description, completed, createdAt }` |
| `validateDescription(description)` | Returns `{ valid, error }` |
| `addTask(taskList, description)` | Returns new array with task appended, or error |
| `deleteTask(taskList, id)` | Returns new array without the target task |
| `toggleTask(taskList, id)` | Returns new array with target task's `completed` flipped |
| `filterTasks(taskList, filter)` | Returns filtered array (`'all'`\|`'active'`\|`'completed'`) |
| `serialize(taskList)` | Returns JSON string |
| `deserialize(json)` | Returns TaskList or `null` on failure — never throws |
| `saveToStorage(taskList)` | Writes to localStorage; returns `{ success: boolean }` |
| `loadFromStorage()` | Reads from localStorage; returns `[]` on missing/invalid data |

### View
DOM rendering functions only. Accept state, produce DOM mutations. No business logic.

| Function | Purpose |
|---|---|
| `renderTaskList(taskList, filter)` | Full re-render of the task list |
| `renderFilterBar(activeFilter)` | Highlights the active filter option |
| `renderEmptyState(visible, message)` | Shows/hides the empty-state message |
| `showInputError(message)` | Displays inline error near the Input_Field |
| `clearInputError()` | Clears the inline error |
| `resetInputField()` | Clears and focuses the Input_Field |

### Controller
Entry point. Wires DOM events → Model → View. Runs on `DOMContentLoaded`.

## Data Model

```js
// Task
{
  id:          string,   // crypto.randomUUID() — unique, immutable
  description: string,   // 1–500 chars, trimmed
  completed:   boolean,  // false on creation
  createdAt:   number    // Date.now() at creation
}

// TaskList — plain Array of Task, insertion-ordered
// Filter   — 'all' | 'active' | 'completed'  (in-memory only, not persisted)
```

## Key Conventions

- **Immutability**: Model functions never mutate their inputs — always return new arrays/objects.
- **No direct localStorage access** outside `saveToStorage` / `loadFromStorage`.
- **No `alert()` or modal dialogs** — all user-facing errors are inline messages near the relevant element.
- **Error logging**: Use `console.error` for storage failures and JSON parse errors; never swallow errors silently.
- **IDs**: Always use `crypto.randomUUID()` — never user-supplied values.
- **State flow**: Event → Controller → Model → `saveToStorage` → View render. Always re-render after state changes.
