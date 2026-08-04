# Style Guide — College Application Tracker

## Project Type
Static site. Plain HTML, CSS, vanilla JavaScript. No frameworks, no build tools.

## File Naming
- ALL files use lowercase kebab-case: `school-detail.js`, `school-detail.css`, `school-detail.html`.
- No camelCase or PascalCase in file names.

## HTML Conventions
- Use semantic HTML5: `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`.
- Every page must include `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- CSS loaded via `<link rel="stylesheet" href="assets/site.css">` then page-specific CSS.
- JS loaded at end of `<body>` via `<script src="js/store.js"></script>` etc.
- Use `data-*` attributes for JS hooks, not classes. Example: `data-action="add-school"`, `data-id="uuid"`.
- IDs for unique page landmarks only. Classes for styling. `data-*` for behavior.
- All paths are RELATIVE. Never start with `/`.

## CSS Conventions
- All design tokens in `:root` in `site.css`. Pages MUST use variables, never hard-coded colors/sizes.
- BEM-lite naming: `.card`, `.card__header`, `.card__body`, `.card--highlighted`.
- No `!important` ever.
- Mobile-first: base styles are for phones. Use `@media (min-width: 768px)` for tablet, `@media (min-width: 1024px)` for desktop.
- Prefer `flexbox` for 1D layouts, `grid` for 2D layouts.
- Transitions: `transition: all 0.15s ease` for interactive elements.
- No animations longer than 300ms.

## JavaScript Conventions
- No `var`. Use `const` by default, `let` when reassignment is needed.
- Functions: prefer named function declarations for top-level; arrow functions for callbacks.
- DOM queries: use `document.querySelector` / `querySelectorAll`. Cache references.
- Event delegation: attach listeners to parent containers, not individual items.
  ```js
  document.querySelector('[data-list="schools"]').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    // handle action
  });
  ```
- No global variables except `window.__READONLY__` (set by router.js).
- Each JS file wraps logic in an IIFE or DOMContentLoaded listener:
  ```js
  document.addEventListener('DOMContentLoaded', () => { ... });
  ```
- Use template literals for HTML generation:
  ```js
  const html = `<div class="card" data-id="${escapeHTML(school.id)}">
    <h3>${escapeHTML(school.name)}</h3>
  </div>`;
  ```
- ALWAYS escape user input with `escapeHTML()` from utils.js before inserting into DOM.

## Data Patterns
- All data access goes through `store.js`. No direct `localStorage` calls elsewhere (except auth.js for session management).
- IDs generated via `crypto.randomUUID()` with fallback.
- Dates stored as ISO strings (`YYYY-MM-DD`). Displayed via `utils.formatDate()`.
- Completion % calculated on the fly, never stored.

## Read-Only Mode
- `router.js` sets `window.__READONLY__ = true` for parent/counselor roles.
- Every page checks this flag. When true:
  - Hide all "Add", "Edit", "Delete" buttons.
  - Disable all form inputs and checkboxes.
  - Show a subtle banner: "Viewing as [role] — read-only".
- Implement by adding `readonly` class to `<body>` and using CSS:
  ```css
  body.readonly .btn--add,
  body.readonly .btn--edit,
  body.readonly .btn--delete { display: none; }
  body.readonly input,
  body.readonly textarea,
  body.readonly select { pointer-events: none; opacity: 0.7; }
  ```

## Error Handling
- Validate all form inputs before saving. Show inline error messages.
- Use `renderToast(message, 'error')` for unexpected issues.
- Never let the app crash silently — wrap localStorage access in try/catch.

## Accessibility
- All interactive elements must be keyboard-accessible.
- Use `aria-label` on icon-only buttons.
- Form inputs must have associated `<label>` elements.
- Color is never the only indicator — always pair with text or icons.
- Focus-visible styles on all interactive elements.

## Security
- ALWAYS escape user-generated content before inserting into the DOM to prevent XSS.
- No external requests of any kind — no CDN scripts, no remote fonts, no fetch/XHR calls.
- Password "hashing" uses SHA-256 via Web Crypto API. This is cosmetic security only; this is a client-side demo.