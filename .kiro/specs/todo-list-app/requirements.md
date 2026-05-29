# Requirements Document

## Introduction

A simple, browser-based todo list web application built with plain HTML, CSS, and JavaScript — no frameworks, no npm, no build tools. Users can add, complete, and delete tasks, with all data persisted to the browser's local storage so tasks survive page refreshes.

## Glossary

- **App**: The todo list web application running in the browser.
- **Task**: A single todo item consisting of a text description and a completion status.
- **Task_List**: The ordered collection of all Tasks currently managed by the App.
- **Input_Field**: The text input element where the user types a new task description.
- **Add_Button**: The button element that triggers task creation when clicked.
- **Task_Item**: The rendered HTML element representing a single Task in the Task_List.
- **Complete_Button**: The button or checkbox within a Task_Item that toggles the Task's completion status.
- **Delete_Button**: The button within a Task_Item that removes the Task from the Task_List.
- **Local_Storage**: The browser's `localStorage` API used to persist Task data between sessions.
- **Filter**: A UI control that limits which Tasks are visible based on their completion status (All, Active, Completed).

---

## Requirements

### Requirement 1: Add a Task

**User Story:** As a user, I want to add new tasks to my todo list, so that I can capture things I need to accomplish.

#### Acceptance Criteria

1. WHEN a user types a task description into the Input_Field and presses the Enter key, THE App SHALL create a new Task and append it to the Task_List.
2. WHEN a user types a task description into the Input_Field and clicks the Add_Button, THE App SHALL create a new Task and append it to the Task_List.
3. WHEN a user attempts to add a Task whose description consists entirely of whitespace characters or is empty, THE App SHALL reject the addition, leave the Task_List unchanged, and display a visible inline error message near the Input_Field.
4. WHEN a user attempts to add a Task whose description exceeds 500 characters, THE App SHALL reject the addition and display a visible inline error message near the Input_Field indicating the character limit.
5. WHEN a new Task is successfully added, THE App SHALL clear the Input_Field and return focus to it within 500ms.
6. WHEN a new Task is successfully added, THE App SHALL persist the updated Task_List to Local_Storage before the add operation is considered complete.
7. IF writing to Local_Storage fails when adding a Task, THEN THE App SHALL still display the new Task in the Task_List and log an error message indicating the storage failure to the browser console.

---

### Requirement 2: Display Tasks

**User Story:** As a user, I want to see all my tasks displayed clearly, so that I can understand what I need to do.

#### Acceptance Criteria

1. THE App SHALL render each Task in the Task_List as a Task_Item showing the task description text.
2. WHEN a Task is marked as completed, THE App SHALL apply a strikethrough style to the task description text and reduce the Task_Item's opacity to visually distinguish it from incomplete tasks.
3. IF the Task_List is empty, THEN THE App SHALL display an empty-state message indicating there are no tasks.
4. WHEN a Task is unmarked as completed, THE App SHALL remove the strikethrough style and restore the Task_Item's opacity to its default value.

---

### Requirement 3: Complete a Task

**User Story:** As a user, I want to mark tasks as complete, so that I can track my progress.

#### Acceptance Criteria

1. WHEN a user clicks the Complete_Button on a Task_Item whose completion status is `incomplete`, THE App SHALL set the Task's completion status to `complete`.
2. WHEN a user clicks the Complete_Button on a Task_Item whose completion status is `complete`, THE App SHALL set the Task's completion status to `incomplete`.
3. WHEN a Task's completion status changes to `complete`, THE App SHALL apply a strikethrough style to the task description text and set the Complete_Button to a checked state within 100ms.
4. WHEN a Task's completion status changes to `incomplete`, THE App SHALL remove the strikethrough style from the task description text and set the Complete_Button to an unchecked state within 100ms.
5. WHEN a Task's completion status changes, THE App SHALL persist the updated Task_List to Local_Storage within 300ms.
6. IF a toggle operation fails due to a system error, THEN THE App SHALL revert the Task_Item's visual appearance to its previous state and log an error message indicating the storage failure to the browser console.

---

### Requirement 4: Delete a Task

**User Story:** As a user, I want to remove tasks from my list, so that I can keep the list relevant.

#### Acceptance Criteria

1. WHEN a user clicks the Delete_Button on a Task_Item, THE App SHALL remove that Task from the Task_List.
2. WHEN a Task is deleted, THE App SHALL remove the corresponding Task_Item from the rendered list synchronously before the next user interaction is processed.
3. WHEN a Task is deleted, THE App SHALL persist the updated Task_List to Local_Storage synchronously before the next user interaction is processed.
4. IF the Task_List is empty after a Task is deleted, THEN THE App SHALL render the Task_List as an empty list with no Task_Items displayed.

---

### Requirement 5: Filter Tasks

**User Story:** As a user, I want to filter tasks by status, so that I can focus on what is relevant.

#### Acceptance Criteria

1. THE App SHALL provide a Filter control with three options: "All", "Active", and "Completed".
2. WHEN the App initialises, THE App SHALL set the active filter to "All" by default.
3. WHEN the "All" filter is selected, THE App SHALL display every Task in the Task_List.
4. WHEN the "Active" filter is selected, THE App SHALL display only Tasks whose completion status is `incomplete`.
5. WHEN the "Completed" filter is selected, THE App SHALL display only Tasks whose completion status is `complete`.
6. WHEN a filter option is selected, THE App SHALL apply a visually distinct style to that option that differentiates it from the unselected options.
7. IF no Tasks match the currently active filter, THEN THE App SHALL display an empty-state message indicating no tasks match the current filter.

---

### Requirement 6: Persist and Restore Tasks

**User Story:** As a user, I want my tasks to be saved between sessions, so that I do not lose my data when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN the App initialises and Local_Storage contains a parseable JSON array, THE App SHALL load the Task_List from Local_Storage and render all persisted Tasks.
2. WHEN Local_Storage contains no previously saved data, THE App SHALL initialise with an empty Task_List.
3. WHEN a Task is added, deleted, or has its completion status changed, THE App SHALL encode the updated Task_List as a JSON string and write it to Local_Storage before the operation is considered complete.
4. IF the data in Local_Storage cannot be parsed as a valid JSON array, THEN THE App SHALL initialise with an empty Task_List and log an error message indicating the parse failure to the browser console.
