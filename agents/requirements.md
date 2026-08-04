# Requirements Context — College Application Tracker

## Project Summary
A client-side web application for high school students to track their college applications. All data persists in the browser's localStorage. No server, no database, no API.

## Target Users
1. **Student** (primary) — Adds schools, tracks deadlines, manages essays and recommendations. Full read-write access to their own data.
2. **Parent/Mentor** (viewer) — Links to a student's account via invite code. Can view all data but cannot add, edit, or delete anything. Read-only access.
3. **Counselor** (admin viewer) — Links to multiple students. Sees a student roster. Can open any linked student's full tracker in read-only mode.

## Core Entities
- **School**: University being applied to. Has metadata, a deadline, application type, status, outcome, category (Reach/Target/Safety), and an embedded checklist.
- **Checklist Item**: Belongs to a school. Represents one task (e.g., "Send transcript"). Has a label, optional due date, and completed boolean.
- **Essay**: A piece of writing for one or more schools. Has prompt, word limit, status (Not Started → Drafting → Revising → Final), and draft text.
- **Recommendation**: Tracks a teacher/recommender. Has teacher name, date asked, linked schools, and submitted status.
- **User**: Email, name, role, optional invite code, linked student IDs.

## Business Rules
1. When a school is added, a default checklist of 9 items is auto-created.
2. Users can add or remove checklist items freely.
3. Completion percentage = checked items / total items × 100 (calculated, not stored).
4. Marking a school "Submitted" moves it to a submitted section and locks editing (except for setting outcome).
5. Only one school can be marked "Committed" at a time.
6. Overdue items (due date in the past AND not completed) are flagged everywhere they appear.
7. The dashboard's "Next 7 Days" panel aggregates deadlines from school deadlines AND individual checklist item due dates.
8. Parent/counselor invite flow: Student generates a 6-character invite code in Settings. Parent/counselor enters this code at sign-up or in their Settings to link.
9. A counselor can be linked to many students. A parent can be linked to one or more students.
10. Data is per-browser (localStorage). No sync across devices.

## Non-Functional Requirements
- Must work offline (no network needed after initial page load).
- Must render well on screens from 320px to 2560px wide.
- Page load must be instant (no build, no framework, no remote resources).
- Must handle empty states gracefully with friendly messaging.
- Must not lose data on page refresh (localStorage persistence).
- Must escape all user-generated content to prevent XSS.

## Out of Scope (Explicitly NOT building)
- Server-side anything (no Node, no API, no database server).
- Real authentication / security (password "hashing" is cosmetic only).
- Multi-device sync.
- Email notifications.
- File uploads (essays are pasted as text).
- Integration with Common App, Coalition App, or any external service.
- PDF export.
- Collaborative editing.

## Data Schema

All data lives under a single `localStorage` key: `"collegeTracker"`.

### User
```json
{
  "id": "uuid",
  "email": "student@example.com",
  "passwordHash": "sha256-hex",
  "name": "Jane Doe",
  "role": "student",
  "linkedStudents": [],
  "inviteCode": "ABC123",
  "createdAt": "2025-01-15T00:00:00Z"
}
```

### School
```json
{
  "id": "uuid",
  "studentId": "uuid",
  "name": "MIT",
  "location": "Cambridge, MA",
  "tuition": "$57,986",
  "acceptanceRate": "4%",
  "deadline": "2026-01-01",
  "appType": "regular",
  "category": "reach",
  "status": "in_progress",
  "outcome": null,
  "committed": false,
  "notes": "",
  "checklist": [
    {
      "id": "uuid",
      "label": "Common App submitted",
      "dueDate": "2025-12-15",
      "completed": false
    }
  ],
  "createdAt": "2025-06-01T00:00:00Z"
}
```

### Essay
```json
{
  "id": "uuid",
  "studentId": "uuid",
  "prompt": "Describe a challenge...",
  "wordLimit": 650,
  "schoolIds": ["uuid1", "uuid2"],
  "status": "not_started",
  "draft": "",
  "createdAt": "2025-06-05T00:00:00Z"
}
```

### Recommendation
```json
{
  "id": "uuid",
  "studentId": "uuid",
  "teacherName": "Mr. Smith",
  "subject": "AP Physics",
  "dateAsked": "2025-09-10",
  "schoolIds": ["uuid1"],
  "submitted": false,
  "createdAt": "2025-09-10T00:00:00Z"
}
```

## Entity Relationships