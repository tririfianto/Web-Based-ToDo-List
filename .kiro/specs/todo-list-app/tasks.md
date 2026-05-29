# Implementation Plan: Todo List App

## Overview

Implement a browser-based todo list app using plain HTML, CSS, and vanilla JavaScript following an MVC pattern. The model layer contains pure functions and localStorage I/O; the view layer handles DOM rendering; the controller wires events to model and view. A separate test file covers unit tests and property-based tests using fast-check.

## Tasks

- [x] 1. Set up project structure and core data model
  - [x] 1.1 Create `index.html` with semantic markup
    - Create the HTML skeleton with an `Input_Field`, `Add_Button`, task list container, filter controls, and empty-state message element
    - Link `style.css` and `app.js` as external files
    - Use semantic HTML5 elements (`<main>`, `<section>`, `<ul>`, `<button>`, `<input>`)
    - _Requirements: 2.1, 5.1_

  - [x] 1.2 Create `style.css` with base styles
    - Style the layout, task items, completed-task strikethrough and opacity, active filter highlight, and empty-state message
    - _Requirements: 2.2, 2.4, 5.6_

  - [x] 1.3 Create `app.js` and implement the Model — task factory and pure transformers
    - Implement `createTask(description)` returning `{ id, description, completed, createdAt }`
    - Implement `validateDescription(description)` returning `{ valid, error }`
    - Implement `addTask(taskList, description)` — validates, creates, appends; returns new array or error
    - Implement `deleteTask(taskList, id)` — returns new array without the target task
    - Implement `toggleTask(taskList, id)` — returns new array with target task's `completed` flipped
    - Implement `filterTasks(taskList, filter)` — returns filtered array for `'all'|'active'|'completed'`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 4.1, 5.3, 5.4, 5.5_

- [x] 2. Implement serialization and localStorage I/O
  - [x] 2.1 Implement `serialize` and `deserialize` in `app.js`
    - `serialize(taskList)` → JSON string
    - `deserialize(json)` → TaskList or `null` on parse failure; never throws
    - Log parse errors to `console.error`
    - _Requirements: 6.3, 6.4_

  - [ ]* 2.2 Write property test for serialization round-trip (Property 6)
    - **Property 6: Serialization round-trip**
    - For any TaskList, `serialize` → `deserialize` produces a deeply equal list (same length, order, and field values)
    - **Validates: Requirements 1.6, 3.5, 4.3, 6.1, 6.3**

  - [ ]* 2.3 Write property test for invalid JSON deserialization (Property 7)
    - **Property 7: Invalid JSON deserializes to null**
    - For any non-JSON-array string, `deserialize` returns `null` without throwing
    - **Validates: Requirements 6.4**

  - [x] 2.4 Implement `saveToStorage` and `loadFromStorage` in `app.js`
    - `saveToStorage(taskList)` — calls `serialize` and writes to `localStorage` key `"todo-list-app"`; catches quota errors, logs to `console.error`, returns `{ success: boolean }`
    - `loadFromStorage()` — reads key, calls `deserialize`; returns `[]` on missing key or parse failure
    - _Requirements: 1.6, 1.7, 3.5, 4.3, 6.1, 6.2, 6.4_

- [x] 3. Checkpoint — Ensure model unit tests pass
  - Create `test.js` (or `test.html` with fast-check via CDN) covering:
    - `createTask` shape and defaults
    - `addTask` with valid description, empty string, and 501-character string
    - `deleteTask` with valid id and non-existent id
    - `toggleTask` flipping `completed` both ways
    - `filterTasks` for all three filter values
    - `serialize`/`deserialize` round-trip with a known fixture
    - `deserialize` with invalid JSON returns `null`
    - `loadFromStorage` with missing key returns `[]`
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement property-based tests for core model functions
  - [x] 4.1 Write property test for task addition (Property 1)
    - **Property 1: Task addition grows the list**
    - For any valid description, `addTask` returns a list whose length is exactly one greater and the new task is present with the correct description
    - **Validates: Requirements 1.1, 1.2**

  - [x] 4.2 Write property test for invalid description rejection (Property 2)
    - **Property 2: Invalid descriptions are rejected**
    - For any whitespace-only or >500-char string, `validateDescription` returns `{ valid: false }` and `addTask` leaves the list unchanged
    - **Validates: Requirements 1.3, 1.4**

  - [x] 4.3 Write property test for toggle idempotence (Property 3)
    - **Property 3: Toggle is its own inverse**
    - For any TaskList and any present task id, calling `toggleTask` twice returns the original `completed` value
    - **Validates: Requirements 3.1, 3.2**

  - [x] 4.4 Write property test for delete (Property 4)
    - **Property 4: Delete removes exactly one task**
    - For any TaskList with at least one task, `deleteTask` with a valid id returns a list of length minus one with the id absent
    - **Validates: Requirements 4.1**

  - [x] 4.5 Write property test for filter correctness (Property 5)
    - **Property 5: Filter correctness**
    - For any TaskList: `'active'` returns only `completed === false`; `'completed'` returns only `completed === true`; `'all'` returns every task
    - **Validates: Requirements 5.3, 5.4, 5.5**

- [x] 5. Implement the View layer
  - [x] 5.1 Implement `renderTaskList(taskList, filter)` in `app.js`
    - Clear and re-render the task list container
    - Each Task_Item includes the description text, a Complete_Button (checkbox), and a Delete_Button
    - Apply strikethrough style and reduced opacity to completed tasks
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 5.2 Implement `renderFilterBar(activeFilter)` in `app.js`
    - Highlight the active filter option with a visually distinct style
    - _Requirements: 5.6_

  - [x] 5.3 Implement `renderEmptyState(visible, message)` in `app.js`
    - Show or hide the empty-state message element with the provided text
    - _Requirements: 2.3, 5.7_

  - [x] 5.4 Implement `showInputError(message)`, `clearInputError()`, and `resetInputField()` in `app.js`
    - Display inline validation error near the Input_Field
    - Clear the Input_Field and return focus to it
    - _Requirements: 1.3, 1.4, 1.5_

- [x] 6. Implement the Controller and wire everything together
  - [x] 6.1 Implement the Controller entry point in `app.js`
    - On `DOMContentLoaded`: call `loadFromStorage()`, set default filter to `'all'`, call `renderTaskList` and `renderFilterBar`
    - Attach keypress listener on Input_Field for Enter key → `addTask` → `saveToStorage` → re-render → `resetInputField`; show inline error on validation failure
    - Attach click listener on Add_Button with same logic
    - Attach delegated click listener on task list container for Complete_Button → `toggleTask` → `saveToStorage` → re-render; revert and log on error
    - Attach delegated click listener on task list container for Delete_Button → `deleteTask` → `saveToStorage` → re-render
    - Attach click listeners on filter controls → update active filter → `renderTaskList` → `renderFilterBar`
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 1.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 5.2, 6.1, 6.2_

  - [ ]* 6.2 Write integration smoke tests
    - Verify that adding a task renders a Task_Item with the correct description
    - Verify that toggling a task applies/removes the completed style
    - Verify that deleting a task removes the Task_Item from the DOM
    - Verify that the empty-state message appears when the list is empty
    - _Requirements: 2.1, 2.2, 2.3, 4.4_

- [x] 7. Final checkpoint — Ensure all tests pass
  - Run all unit tests and property-based tests
  - Verify the app opens correctly in a browser by loading `index.html` directly from the filesystem
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (Properties 1–7 from the design)
- Unit tests validate specific examples and edge cases
- The app has no build pipeline; tests can be run with Node.js + Vitest/Jest or via a `test.html` file using fast-check from CDN

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "5.1", "5.2", "5.3", "5.4"] },
    { "id": 4, "tasks": ["6.1"] },
    { "id": 5, "tasks": ["6.2"] }
  ]
}
```
