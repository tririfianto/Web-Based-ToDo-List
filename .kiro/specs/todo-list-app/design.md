# Design Document: Todo List App

## Overview

A lightweight, browser-based todo list application built with plain HTML, CSS, and vanilla JavaScript — no frameworks, no build tools, no npm. The entire app ships as a single `index.html` file (or a small set of co-located static files) that can be opened directly in any modern browser.

The app lets users add, complete, and delete tasks, filter the list by status, and automatically persists all data to `localStorage` so tasks survive page refreshes and browser restarts.

### Design Goals

- **Zero dependencies**: No external libraries, no CDN scripts, no build pipeline.
- **Single-file deployable**: The app works by opening `index.html` directly from the filesystem.
- **Progressive enhancement**: Core functionality works without JavaScript (graceful degradation is not required, but the HTML structure should be semantic).
- **Testable logic**: Business logic is separated from DOM manipulation so it can be unit-tested and property-tested without a browser.

---

## Architecture

The app follows a simple **Model → View → Controller** separation, implemented as plain JavaScript modules (or IIFE namespaces if ES modules are unavailable in the target environment).

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│                                                     │
│  ┌──────────┐    events    ┌──────────────────────┐ │
│  │   View   │◄────────────►│     Controller       │ │
│  │  (DOM)   │              │  (event handlers,    │ │
│  └──────────┘              │   orchestration)     │ │
│       ▲                    └──────────┬───────────┘ │
│       │ render()                      │             │
│       │                    ┌──────────▼───────────┐ │
│       └────────────────────│       Model          │ │
│                            │  (pure functions,    │ │
│                            │   state, storage)    │ │
│                            └──────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| **Model** | Task data structures, pure transformation functions (add, delete, toggle, filter, serialize/deserialize), localStorage I/O |
| **View** | DOM rendering functions — take state and produce HTML/DOM mutations; no business logic |
| **Controller** | Wires DOM events to model functions; calls view render after each state change |

### State Flow

1. User triggers a DOM event (keypress, click).
2. Controller calls the appropriate Model function.
3. Model updates in-memory state and writes to localStorage.
4. Controller calls View render functions with the new state.
5. View updates the DOM.

---

## Components and Interfaces

### Model API

```js
// Task factory — returns a new Task object
function createTask(description)
// Returns: { id: string, description: string, completed: boolean, createdAt: number }

// Pure state transformers — return new arrays, never mutate
function addTask(taskList, description)       // → TaskList | Error
function deleteTask(taskList, id)             // → TaskList
function toggleTask(taskList, id)             // → TaskList
function filterTasks(taskList, filter)        // → TaskList  (filter: 'all'|'active'|'completed')

// Validation
function validateDescription(description)    // → { valid: boolean, error: string|null }

// Serialization
function serialize(taskList)                  // → string (JSON)
function deserialize(json)                    // → TaskList | null (null on parse failure)

// localStorage I/O
function saveToStorage(taskList)              // → { success: boolean }
function loadFromStorage()                    // → TaskList (empty array on failure/missing)
```

### View API

```js
// Full re-render of the task list area
function renderTaskList(taskList, filter)

// Render the filter bar (highlights active filter)
function renderFilterBar(activeFilter)

// Show/hide the empty-state message
function renderEmptyState(visible, message)

// Show/clear inline validation error near the Input_Field
function showInputError(message)
function clearInputError()

// Clear and focus the Input_Field
function resetInputField()
```

### Controller

The controller is the entry point. It:
1. Calls `loadFromStorage()` on `DOMContentLoaded`.
2. Attaches event listeners to the Input_Field, Add_Button, task list (delegated), and filter controls.
3. Calls model functions and then re-renders on each state change.

### File Structure

```
index.html          ← markup + inline <style> and <script> tags, OR
index.html          ← markup only
style.css           ← styles
app.js              ← model + view + controller
```

Either layout is acceptable. Keeping logic in `app.js` makes it easier to test.

---

## Data Models

### Task

```js
{
  id:          string,   // UUID v4 or crypto.randomUUID() — unique, immutable
  description: string,   // 1–500 characters, trimmed
  completed:   boolean,  // false = incomplete, true = complete
  createdAt:   number    // Date.now() timestamp at creation
}
```

### TaskList

An ordered JavaScript `Array` of `Task` objects. Order is insertion order (newest tasks appended to the end). The array is the single source of truth for in-memory state.

### Filter

A string enum: `'all' | 'active' | 'completed'`. Default value: `'all'`. Stored only in memory (not persisted to localStorage).

### LocalStorage Schema

```
Key:   "todo-list-app"
Value: JSON string — a JSON array of Task objects

Example:
[
  { "id": "a1b2c3d4-...", "description": "Buy milk", "completed": false, "createdAt": 1700000000000 },
  { "id": "e5f6g7h8-...", "description": "Walk the dog", "completed": true,  "createdAt": 1700000001000 }
]
```

On parse failure the app initialises with `[]` and logs the error.

### Validation Rules

| Field | Rule |
|---|---|
| `description` | Must not be empty or whitespace-only after trimming |
| `description` | Must be ≤ 500 characters after trimming |
| `id` | Auto-generated; never user-supplied |
| `completed` | Boolean; defaults to `false` on creation |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Task addition grows the list

*For any* TaskList and any valid description (non-empty after trimming, ≤ 500 characters), calling `addTask` should return a TaskList whose length is exactly one greater than the original, and the new Task should appear in the result with the correct description.

**Validates: Requirements 1.1, 1.2**

### Property 2: Invalid descriptions are rejected

*For any* string that is either composed entirely of whitespace characters (including the empty string) or whose length exceeds 500 characters, calling `validateDescription` should return `{ valid: false }`, and calling `addTask` with that description should leave the TaskList unchanged.

**Validates: Requirements 1.3, 1.4**

### Property 3: Toggle is its own inverse

*For any* TaskList and any Task `id` present in that list, calling `toggleTask` twice in succession should return a TaskList where the target Task's `completed` value is identical to its original value (round-trip idempotence).

**Validates: Requirements 3.1, 3.2**

### Property 4: Delete removes exactly one task

*For any* TaskList containing at least one Task, calling `deleteTask` with a valid `id` should return a TaskList whose length is exactly one less than the original, and the deleted Task's `id` should not appear anywhere in the result.

**Validates: Requirements 4.1**

### Property 5: Filter correctness

*For any* TaskList:
- When filter is `'active'`, every Task returned by `filterTasks` should have `completed === false`.
- When filter is `'completed'`, every Task returned should have `completed === true`.
- When filter is `'all'`, the returned list should contain every Task in the original list (same length, same ids).

**Validates: Requirements 5.3, 5.4, 5.5**

### Property 6: Serialization round-trip

*For any* TaskList, calling `serialize` followed by `deserialize` should produce a TaskList that is deeply equal to the original — same number of tasks, same order, and each Task having identical `id`, `description`, `completed`, and `createdAt` values.

**Validates: Requirements 1.6, 3.5, 4.3, 6.1, 6.3**

### Property 7: Invalid JSON deserializes to null

*For any* string that is not a valid JSON array of Task objects, calling `deserialize` should return `null` (or an empty array), never throwing an exception and never returning a partially-constructed TaskList.

**Validates: Requirements 6.4**

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Empty / whitespace description | `validateDescription` returns error; inline error message shown near Input_Field; TaskList unchanged |
| Description > 500 characters | Same as above with character-limit message |
| `localStorage.setItem` throws (e.g. storage quota exceeded) | Task is still added/updated in memory and rendered; error logged to `console.error` |
| `localStorage.getItem` returns unparseable JSON | App initialises with empty TaskList; error logged to `console.error` |
| `localStorage.getItem` returns `null` (no prior data) | App initialises with empty TaskList (no error logged) |
| Toggle fails due to unexpected error | Visual state reverted to previous; error logged to `console.error` |
| Task `id` not found in list (stale reference) | Operation is a no-op; no error thrown |

All user-facing errors are displayed as inline messages near the relevant UI element. No modal dialogs or `alert()` calls.

---

## Testing Strategy

### Approach

Because the app has no build pipeline, tests run in one of two ways:

1. **Node.js with a test runner** (e.g. [Vitest](https://vitest.dev/) or [Jest](https://jestjs.io/)) — for pure model functions that have no DOM dependency. This is the primary testing environment.
2. **Browser-based test runner** (e.g. [QUnit](https://qunitjs.com/) loaded via CDN in a `test.html` file) — for view/DOM tests, as a zero-install fallback.

Since the project has no npm setup, the recommended approach is to keep model logic in a plain `.js` file that can be `require()`-d or `import`-ed by a test runner invoked with `node`.

### Unit Tests

Unit tests cover specific examples, edge cases, and error conditions:

- `createTask` produces a Task with the correct shape and defaults.
- `addTask` with a valid description appends a Task.
- `addTask` with an empty string returns an error / leaves list unchanged.
- `addTask` with a 501-character string returns an error.
- `deleteTask` removes the correct Task.
- `deleteTask` on a non-existent id is a no-op.
- `toggleTask` flips `completed` from `false` to `true` and back.
- `filterTasks('active')` returns only incomplete tasks.
- `filterTasks('completed')` returns only complete tasks.
- `filterTasks('all')` returns all tasks.
- `serialize` / `deserialize` round-trip with a known fixture.
- `deserialize` with invalid JSON returns `null`.
- `loadFromStorage` with missing key returns `[]`.

### Property-Based Tests

Property-based tests use **[fast-check](https://fast-check.io/)** (loaded via CDN or installed as a dev dependency). Each test runs a minimum of **100 iterations**.

Each test is tagged with a comment in the format:
`// Feature: todo-list-app, Property N: <property text>`

| Property | Test description |
|---|---|
| Property 1 | For any valid description, `addTask` grows the list by exactly 1 and the task is present |
| Property 2 | For any whitespace-only or >500-char string, `addTask` leaves the list unchanged |
| Property 3 | For any Task, `toggleTask` twice returns the original `completed` value |
| Property 4 | For any Task in the list, `deleteTask` reduces length by 1 and removes the id |
| Property 5 | For any TaskList, `filterTasks` returns only Tasks matching the filter predicate for all three modes |
| Property 6 | For any TaskList, `serialize` → `deserialize` produces a deeply equal list |
| Property 7 | For any non-JSON-array string, `deserialize` returns null without throwing |

### Integration / Smoke Tests

- Opening `index.html` in a browser renders the empty-state message.
- Adding a task, refreshing the page, and verifying the task is still present (manual or Playwright smoke test).
