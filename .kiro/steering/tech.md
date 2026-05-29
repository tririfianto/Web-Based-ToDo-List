# Tech Stack

## Core Technologies

- **HTML5** — semantic markup (`<main>`, `<section>`, `<ul>`, `<button>`, `<input>`)
- **CSS3** — plain stylesheet, no preprocessors
- **Vanilla JavaScript (ES6+)** — no frameworks, no libraries, no npm

## Constraints

- **Zero dependencies** — no external libraries, no CDN scripts in production code
- **No build pipeline** — no bundler, no transpiler, no package manager required
- **Single-origin deployable** — the app works by opening `index.html` directly from the filesystem (`file://`)

## Testing

- **Unit & property-based tests**: [Vitest](https://vitest.dev/) or [Jest](https://jestjs.io/) via Node.js for pure model functions (no DOM dependency)
- **Browser-based fallback**: [QUnit](https://qunitjs.com/) + [fast-check](https://fast-check.io/) loaded via CDN in a `test.html` file
- **Property-based testing library**: fast-check (minimum 100 iterations per property test)
- Property tests are tagged with: `// Feature: todo-list-app, Property N: <property text>`

## Common Commands

```bash
# Run unit + property tests with Vitest (if Node.js setup is used)
npx vitest run

# Run unit + property tests with Jest
npx jest

# Open the app directly in the browser (no server needed)
# Just open index.html from the filesystem
```

> If no npm setup exists, open `test.html` in a browser to run tests via CDN-loaded fast-check and QUnit.

## localStorage

- Key: `"todo-list-app"`
- Value: JSON-serialized array of Task objects
- All reads/writes go through `loadFromStorage()` / `saveToStorage()` — never access `localStorage` directly outside the model layer
