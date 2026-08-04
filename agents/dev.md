# Codi — Development Instructions for College Application Tracker

## Stack
Plain HTML + CSS + vanilla JS. No npm. No build. No external resources.

## How to Start
1. Create all files as listed in the folder structure.
2. Start with `js/utils.js` and `js/store.js` — they have no dependencies.
3. Then `js/auth.js` and `js/router.js` — they depend on store.js.
4. Then `js/components.js` — shared UI.
5. Then page-specific JS files.
6. Build HTML pages referencing the CSS and JS.

## Critical Rules
1. **NO external requests.** No CDN, no Google Fonts, no remote images, no fetch(). A CSP blocks all of them. Everything must be local/relative.
2. **Relative paths only.** Never start with `/`. Use `assets/site.css`, not `/assets/site.css`.
3. **Root index.html is required.** This is the entry point (auth page).
4. **System fonts only.** Use the stack defined in site.css.
5. **Inline SVG only.** Create simple SVGs directly in HTML or reference from the local `assets/icons/icons.svg` sprite via `<svg><use href="assets/icons/icons.svg#icon-name"/></svg>`.

## Page Template
Every HTML page follows this structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Name — CollegeTracker</title>
  <link rel="stylesheet" href="assets/site.css">
  <link rel="stylesheet" href="assets/pages/page-name.css">
</head>
<body>
  <nav id="navbar"></nav>
  <main class="container">
    <!-- Page content -->
  </main>
  <div id="modal-root"></div>
  <div id="toast-root"></div>

  <script src="js/utils.js"></script>
  <script src="js/store.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/router.js"></script>
  <script src="js/components.js"></script>
  <script src="js/page-name.js"></script>
</body>
</html>
```

## localStorage Schema
All data lives under a single `localStorage` key: `"collegeTracker"`. This includes users, session, schools, essays, and recommendations.

```jsonc
{
  "users": [...],
  "session": { "userId": "...", "viewingStudentId": "..." },
  "schools": [...],
  "essays": [...],
  "recommendations": [...]
}
```

## Implementing Features — Order of Priority

### Phase 1: Foundation
1. `js/utils.js` — all utility functions
2. `js/store.js` — full CRUD layer
3. `js/auth.js` — sign up/in/out
4. `js/router.js` — page guards + read-only flag
5. `js/components.js` — navbar, modal, toast, empty state
6. `assets/site.css` — all variables, reset, global components
7. `index.html` + `assets/pages/auth.css` — auth page

### Phase 2: Core Pages
8. `dashboard.html` + `js/dashboard.js` + `assets/pages/dashboard.css`
9. `colleges.html` + `js/colleges.js` + `assets/pages/colleges.css`
10. `school-detail.html` + `js/school-detail.js` + `assets/pages/school-detail.css`

### Phase 3: Secondary Pages
11. `essays.html` + `js/essays.js` + `assets/pages/essays.css`
12. `recommendations.html` + `js/recommendations.js` + `assets/pages/recommendations.css`
13. `calendar.html` + `js/calendar.js` + `assets/pages/calendar.css`
14. `settings.html` + `js/settings.js` + `assets/pages/settings.css`

### Phase 4: Polish
15. `assets/icons/icons.svg` — create the SVG sprite
16. Empty states for every list
17. Read-only mode testing
18. Mobile responsiveness pass

## Key Implementation Notes

### Auto-creating checklists
When `store.addSchool()` is called, it should automatically populate the `checklist` array with the default items (transcript, test scores, essays, rec letters, fee, interview, portfolio, application submitted). Each gets a generated ID and `completed: false`.

### Completion Percentage
`calcCompletion(checklist)` = `completedCount / totalCount * 100`, rounded to nearest integer. If checklist is empty, return 0. This is calculated at render time, NEVER stored.

### Dashboard Aggregation
- Total schools: `schools.length`
- Submitted: `schools.filter(s => s.status === 'submitted').length`
- Open: `total - submitted`
- Overall completion: average of all non-submitted schools' completion percentages
- Next 7 days: collect all dates (school deadlines, checklist due dates) where `daysUntil(date) >= 0 && daysUntil(date) <= 7`, sorted ascending

### Status Transitions
- School starts as `not_started`
- When any checklist item is checked: auto-change to `in_progress`
- Student can manually set to `submitted`
- When `submitted`: school moves to submitted section, completion = 100% (override)
- After submission: outcome dropdown appears (Accepted/Rejected/Waitlisted/Deferred)
- "Committed" is a toggle — only one school can be committed at a time

### Password "Hashing"
Use Web Crypto API SHA-256. Not production-grade, but a gesture toward security:
```js
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### Counselor View
Counselors see a student list. When a counselor selects a student, `session.viewingStudentId` is set, and all subsequent data queries filter by that student ID. A "Switch student" button appears in the navbar.

### Modal Pattern
```js
function renderModal(title, bodyHTML, onConfirm, confirmText = 'Save') {
  // Create overlay div
  // Create modal card with title, body, Cancel + Confirm buttons
  // Append to #modal-root
  // Focus trap inside modal
  // Close on Escape key or overlay click
  // onConfirm callback receives form data
}
```

### Toast Pattern
```js
function renderToast(message, type = 'success') {
  // Create toast element
  // Append to #toast-root
  // Auto-remove after 3 seconds
  // Types: 'success' (green), 'error' (red), 'info' (blue)
}
```

### Event Delegation
Always prefer event delegation over individual listeners:
```js
document.querySelector('[data-list="schools"]').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.closest('[data-id]')?.dataset.id;
  // handle action with id
});
```

### HTML Escaping
ALWAYS use `escapeHTML()` from utils.js when inserting user-generated content:
```js
const html = `<h3>${escapeHTML(school.name)}</h3>`;
```
This prevents XSS attacks via school names, essay text, notes, etc.