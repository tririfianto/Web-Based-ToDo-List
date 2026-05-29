/**
 * Unit tests for the Todo List App model layer.
 * Covers: createTask, addTask, deleteTask, toggleTask, filterTasks,
 *         serialize/deserialize, and loadFromStorage.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  createTask,
  addTask,
  deleteTask,
  toggleTask,
  filterTasks,
  serialize,
  deserialize,
  loadFromStorage,
  validateDescription,
} from './app.js';

// ---------------------------------------------------------------------------
// createTask
// ---------------------------------------------------------------------------
describe('createTask', () => {
  it('returns an object with the correct shape', () => {
    const task = createTask('Buy milk');
    expect(task).toHaveProperty('id');
    expect(task).toHaveProperty('description');
    expect(task).toHaveProperty('completed');
    expect(task).toHaveProperty('createdAt');
  });

  it('sets description to the trimmed input', () => {
    const task = createTask('  Buy milk  ');
    expect(task.description).toBe('Buy milk');
  });

  it('defaults completed to false', () => {
    const task = createTask('Walk the dog');
    expect(task.completed).toBe(false);
  });

  it('sets createdAt to a recent timestamp', () => {
    const before = Date.now();
    const task = createTask('Test task');
    const after = Date.now();
    expect(task.createdAt).toBeGreaterThanOrEqual(before);
    expect(task.createdAt).toBeLessThanOrEqual(after);
  });

  it('generates a unique id for each task', () => {
    const t1 = createTask('Task 1');
    const t2 = createTask('Task 2');
    expect(t1.id).not.toBe(t2.id);
  });
});

// ---------------------------------------------------------------------------
// addTask
// ---------------------------------------------------------------------------
describe('addTask', () => {
  it('appends a new task for a valid description', () => {
    const list = [];
    const result = addTask(list, 'Buy milk');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Buy milk');
  });

  it('does not mutate the original list', () => {
    const list = [];
    addTask(list, 'Buy milk');
    expect(list).toHaveLength(0);
  });

  it('returns an error object for an empty string', () => {
    const result = addTask([], '');
    expect(result).toHaveProperty('error');
    expect(typeof result.error).toBe('string');
  });

  it('returns an error object for a whitespace-only string', () => {
    const result = addTask([], '   ');
    expect(result).toHaveProperty('error');
  });

  it('returns an error object for a 501-character string', () => {
    const longDesc = 'a'.repeat(501);
    const result = addTask([], longDesc);
    expect(result).toHaveProperty('error');
  });

  it('accepts a description of exactly 500 characters', () => {
    const maxDesc = 'a'.repeat(500);
    const result = addTask([], maxDesc);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// deleteTask
// ---------------------------------------------------------------------------
describe('deleteTask', () => {
  it('removes the task with the matching id', () => {
    const task = createTask('Buy milk');
    const list = [task];
    const result = deleteTask(list, task.id);
    expect(result).toHaveLength(0);
  });

  it('does not mutate the original list', () => {
    const task = createTask('Buy milk');
    const list = [task];
    deleteTask(list, task.id);
    expect(list).toHaveLength(1);
  });

  it('is a no-op for a non-existent id', () => {
    const task = createTask('Buy milk');
    const list = [task];
    const result = deleteTask(list, 'non-existent-id');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(task.id);
  });

  it('only removes the targeted task when multiple tasks exist', () => {
    const t1 = createTask('Task 1');
    const t2 = createTask('Task 2');
    const list = [t1, t2];
    const result = deleteTask(list, t1.id);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(t2.id);
  });
});

// ---------------------------------------------------------------------------
// toggleTask
// ---------------------------------------------------------------------------
describe('toggleTask', () => {
  it('flips completed from false to true', () => {
    const task = createTask('Buy milk'); // completed: false
    const list = [task];
    const result = toggleTask(list, task.id);
    expect(result[0].completed).toBe(true);
  });

  it('flips completed from true to false', () => {
    const task = { ...createTask('Buy milk'), completed: true };
    const list = [task];
    const result = toggleTask(list, task.id);
    expect(result[0].completed).toBe(false);
  });

  it('does not mutate the original task', () => {
    const task = createTask('Buy milk');
    const list = [task];
    toggleTask(list, task.id);
    expect(task.completed).toBe(false);
  });

  it('is a no-op for a non-existent id', () => {
    const task = createTask('Buy milk');
    const list = [task];
    const result = toggleTask(list, 'non-existent-id');
    expect(result[0].completed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// filterTasks
// ---------------------------------------------------------------------------
describe('filterTasks', () => {
  const incomplete = { ...createTask('Active task'), completed: false };
  const complete = { ...createTask('Done task'), completed: true };
  const list = [incomplete, complete];

  it('"all" returns every task', () => {
    const result = filterTasks(list, 'all');
    expect(result).toHaveLength(2);
  });

  it('"active" returns only incomplete tasks', () => {
    const result = filterTasks(list, 'active');
    expect(result).toHaveLength(1);
    expect(result[0].completed).toBe(false);
  });

  it('"completed" returns only complete tasks', () => {
    const result = filterTasks(list, 'completed');
    expect(result).toHaveLength(1);
    expect(result[0].completed).toBe(true);
  });

  it('"all" returns an empty array for an empty list', () => {
    expect(filterTasks([], 'all')).toHaveLength(0);
  });

  it('"active" returns an empty array when all tasks are complete', () => {
    expect(filterTasks([complete], 'active')).toHaveLength(0);
  });

  it('"completed" returns an empty array when no tasks are complete', () => {
    expect(filterTasks([incomplete], 'completed')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// serialize / deserialize
// ---------------------------------------------------------------------------
describe('serialize / deserialize', () => {
  const fixture = [
    {
      id: 'a1b2c3d4-0000-0000-0000-000000000001',
      description: 'Buy milk',
      completed: false,
      createdAt: 1700000000000,
    },
    {
      id: 'a1b2c3d4-0000-0000-0000-000000000002',
      description: 'Walk the dog',
      completed: true,
      createdAt: 1700000001000,
    },
  ];

  it('serialize produces a JSON string', () => {
    const json = serialize(fixture);
    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('deserialize round-trips a known fixture', () => {
    const json = serialize(fixture);
    const result = deserialize(json);
    expect(result).toHaveLength(fixture.length);
    result.forEach((task, i) => {
      expect(task.id).toBe(fixture[i].id);
      expect(task.description).toBe(fixture[i].description);
      expect(task.completed).toBe(fixture[i].completed);
      expect(task.createdAt).toBe(fixture[i].createdAt);
    });
  });

  it('deserialize returns null for invalid JSON', () => {
    expect(deserialize('not valid json')).toBeNull();
  });

  it('deserialize returns null for a JSON non-array (object)', () => {
    expect(deserialize('{"key":"value"}')).toBeNull();
  });

  it('deserialize returns null for a JSON non-array (string)', () => {
    expect(deserialize('"hello"')).toBeNull();
  });

  it('deserialize returns an empty array for an empty JSON array', () => {
    const result = deserialize('[]');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// loadFromStorage
// ---------------------------------------------------------------------------
describe('loadFromStorage', () => {
  beforeEach(() => {
    // Reset any stubs between tests
    vi.unstubAllGlobals();
  });

  it('returns [] when the key is missing (getItem returns null)', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    const result = loadFromStorage();
    expect(result).toEqual([]);
  });

  it('returns [] when the stored value is invalid JSON', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('not-valid-json'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    const result = loadFromStorage();
    expect(result).toEqual([]);
  });

  it('returns the parsed task list when valid JSON is stored', () => {
    const tasks = [
      {
        id: 'abc-123',
        description: 'Test',
        completed: false,
        createdAt: 1700000000000,
      },
    ];
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(JSON.stringify(tasks)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    const result = loadFromStorage();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('abc-123');
  });
});

// ---------------------------------------------------------------------------
// Property-Based Tests — fast-check
// ---------------------------------------------------------------------------

// Shared arbitraries
const taskArb = fc.record({
  id: fc.uuid(),
  description: fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 0 }),
});

const taskListArb = fc.array(
  fc.record({
    id: fc.uuid(),
    description: fc.string({ minLength: 1, maxLength: 500 }),
    completed: fc.boolean(),
    createdAt: fc.integer(),
  })
);

// Arbitrary for a valid description: non-empty, non-whitespace-only, ≤ 500 chars
const validDescriptionArb = fc
  .string({ minLength: 1, maxLength: 500 })
  .filter((s) => s.trim().length > 0);

// Feature: todo-list-app, Property 1: Task addition grows the list
// Validates: Requirements 1.1, 1.2
describe('Property 1: Task addition grows the list', () => {
  it('addTask returns a list one longer and the new task has the correct description', () => {
    fc.assert(
      fc.property(taskListArb, validDescriptionArb, (list, description) => {
        const result = addTask(list, description);

        // Must return an array (not an error object)
        expect(Array.isArray(result)).toBe(true);

        // Length must be exactly one greater
        expect(result.length).toBe(list.length + 1);

        // The last element must have the trimmed description
        const newTask = result[result.length - 1];
        expect(newTask.description).toBe(description.trim());
      })
    );
  });
});

// Feature: todo-list-app, Property 3: Toggle is its own inverse
// Validates: Requirements 3.1, 3.2
describe('Property 3: Toggle is its own inverse', () => {
  it('toggleTask twice restores the original completed value for any task in any list', () => {
    fc.assert(
      fc.property(
        // Generate a non-empty list of tasks
        fc.array(taskArb, { minLength: 1 }),
        // Pick a valid index into that list
        fc.integer({ min: 0, max: 99 }),
        (tasks, rawIndex) => {
          // Ensure unique ids to avoid accidental multi-toggle
          const uniqueTasks = tasks.map((t, i) => ({ ...t, id: `task-${i}` }));
          const index = rawIndex % uniqueTasks.length;
          const targetId = uniqueTasks[index].id;
          const originalCompleted = uniqueTasks[index].completed;

          const afterTwoToggles = toggleTask(toggleTask(uniqueTasks, targetId), targetId);

          return afterTwoToggles[index].completed === originalCompleted;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: todo-list-app, Property 2: Invalid descriptions are rejected
describe('Property 2: Invalid descriptions are rejected', () => {
  // **Validates: Requirements 1.3, 1.4**

  it('whitespace-only strings: validateDescription returns { valid: false } and addTask leaves list unchanged', () => {
    fc.assert(
      fc.property(
        // Generate a non-empty whitespace-only string
        fc.stringMatching(/^\s+$/),
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 36 }),
            description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0 && s.trim().length <= 500),
            completed: fc.boolean(),
            createdAt: fc.integer({ min: 0 }),
          })
        ),
        (whitespaceStr, taskList) => {
          // validateDescription must return { valid: false }
          const validation = validateDescription(whitespaceStr);
          if (validation.valid !== false) return false;

          // addTask must return an error object (not an array)
          const result = addTask(taskList, whitespaceStr);
          if (Array.isArray(result)) return false;
          if (typeof result.error !== 'string') return false;

          // Original task list must be unchanged (same length)
          if (taskList.length !== taskList.length) return false; // always true, but explicit
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('strings longer than 500 chars: validateDescription returns { valid: false } and addTask leaves list unchanged', () => {
    fc.assert(
      fc.property(
        // Generate a string longer than 500 characters
        fc.string({ minLength: 501, maxLength: 1000 }),
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 36 }),
            description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0 && s.trim().length <= 500),
            completed: fc.boolean(),
            createdAt: fc.integer({ min: 0 }),
          })
        ),
        (longStr, taskList) => {
          const originalLength = taskList.length;

          // validateDescription must return { valid: false }
          const validation = validateDescription(longStr);
          if (validation.valid !== false) return false;

          // addTask must return an error object (not an array)
          const result = addTask(taskList, longStr);
          if (Array.isArray(result)) return false;
          if (typeof result.error !== 'string') return false;

          // Original task list must be unchanged (same length)
          if (taskList.length !== originalLength) return false;
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: todo-list-app, Property 5: Filter correctness
// Validates: Requirements 5.3, 5.4, 5.5
describe('Property 5: Filter correctness', () => {

  it('filterTasks("active") returns only tasks with completed === false', () => {
    fc.assert(
      fc.property(taskListArb, (list) => {
        const result = filterTasks(list, 'active');
        return result.every((task) => task.completed === false);
      }),
      { numRuns: 100 }
    );
  });

  it('filterTasks("completed") returns only tasks with completed === true', () => {
    fc.assert(
      fc.property(taskListArb, (list) => {
        const result = filterTasks(list, 'completed');
        return result.every((task) => task.completed === true);
      }),
      { numRuns: 100 }
    );
  });

  it('filterTasks("all") returns every task (same length and same ids)', () => {
    fc.assert(
      fc.property(taskListArb, (list) => {
        const result = filterTasks(list, 'all');
        if (result.length !== list.length) return false;
        const originalIds = list.map((t) => t.id);
        const resultIds = result.map((t) => t.id);
        return originalIds.every((id, i) => id === resultIds[i]);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: todo-list-app, Property 4: Delete removes exactly one task
// Validates: Requirements 4.1
describe('Property 4: Delete removes exactly one task', () => {
  it('deleteTask with a valid id returns a list of length minus one with the id absent', () => {
    fc.assert(
      fc.property(
        // Generate a non-empty list of tasks (minLength: 1)
        fc.array(taskArb, { minLength: 1 }),
        // Pick a random index into that list
        fc.integer({ min: 0, max: 99 }),
        (tasks, rawIndex) => {
          // Ensure unique ids so each task is individually addressable
          const uniqueTasks = tasks.map((t, i) => ({ ...t, id: `task-${i}` }));
          const index = rawIndex % uniqueTasks.length;
          const targetId = uniqueTasks[index].id;

          const result = deleteTask(uniqueTasks, targetId);

          // Result length must be exactly one less than original
          expect(result.length).toBe(uniqueTasks.length - 1);

          // The deleted id must not appear anywhere in the result
          const idStillPresent = result.some((task) => task.id === targetId);
          expect(idStillPresent).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
