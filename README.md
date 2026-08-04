# College Application Tracker

A client-side web application for high school students to track their college applications, essays, recommendations, and deadlines. All data persists in the browser's `localStorage` — no server, no database, no external services.

## Features

- **Dashboard** — Summary cards showing total schools, submitted/open applications, overall progress, and upcoming deadlines within the next 7 days.
- **My Colleges** — Sortable, filterable table of schools with category dots (Reach/Target/Safety), deadline tracking, and completion percentages. Collapses to cards on mobile.
- **School Detail** — Per-school view with editable info, an interactive checklist (auto-populated with 9 default items), and a notes section.
- **Essay Tracker** — Create and manage essays linked to one or more schools. Track status through Not Started → Drafting → Revising → Final.
- **Recommendations** — Track recommendation letters by teacher, date asked, linked schools, and submitted status.
- **Calendar** — Month-view CSS Grid calendar showing all deadlines. Overdue items highlighted in red.
- **Settings** — Update profile, change password, generate invite codes for parents/counselors.
- **Role-based access** — Students have full read-write. Parents and counselors link via invite code and view data read-only.

## How to Run

1. Clone or download this repository.
2. Open `index.html` in any modern web browser.

That's it. No build step, no npm install, no server required.

### Optional: Local Static Server

If you prefer a local server (useful for cleaner URL handling):

```bash
# Python 3
python -m http.server 8080

# Then open http://localhost:8080
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML 5 (semantic elements) |
| Styling | CSS 3 (custom properties, Grid, Flexbox) |
| Logic | Vanilla JavaScript (ES2020) |
| Persistence | `localStorage` (JSON-serialized) |
| Routing | File-based (one `.html` per page) |
| Fonts | System font stack |
| Icons | Inline SVG |

## Project Structure
