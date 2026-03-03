# StudyBuddy Backend — API Reference

Base URL: `http://localhost:3000/api/v1`

All endpoints (except `/auth/register` and `/auth/login`) require a Bearer token:
```
Authorization: Bearer <token>
```

---

## Setup (run once)

```bash
npm run db:push      # Push schema to Neon PostgreSQL
npm run db:seed      # Seed with test data
npm run dev          # Start dev server on :3000
```

**Test credentials (after seeding)**
| Role    | Email              | Password    |
|---------|--------------------|-------------|
| Student | arjun@study.com    | student123  |
| Student | sneha@study.com    | student123  |
| Faculty | priya@study.com    | faculty123  |
| Admin   | admin@study.com    | admin123    |

---

## 1. Auth

### POST `/auth/register`
Create a new account.

**Body**
```json
{
  "name": "Arjun Mehta",
  "email": "arjun@study.com",
  "password": "student123",
  "role": "student",
  "currentSemester": 1
}
```

**Response `201`**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "name": "Arjun Mehta",
    "avatar": "AM",
    "email": "arjun@study.com",
    "role": "student",
    "currentSemester": 1
  }
}
```

---

### POST `/auth/login`
Sign in and get a JWT token.

**Body**
```json
{
  "email": "arjun@study.com",
  "password": "student123"
}
```

**Response `200`**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "name": "Arjun Mehta",
    "avatar": "AM",
    "email": "arjun@study.com",
    "role": "student",
    "currentSemester": 1
  }
}
```

---

### GET `/auth/me`
Get the currently logged-in user's profile.

**Response `200`**
```json
{
  "id": "uuid",
  "name": "Arjun Mehta",
  "avatar": "AM",
  "email": "arjun@study.com",
  "role": "student",
  "currentSemester": 1,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

---

## 2. Catalog

### GET `/semesters`
List all semesters (1–8).

**Response `200`**
```json
[
  { "id": 1, "label": "Semester 1" },
  { "id": 2, "label": "Semester 2" }
]
```

---

### GET `/semesters/:semesterId/subjects`
List subjects for a given semester.

**Example:** `GET /semesters/1/subjects`

**Response `200`**
```json
[
  { "id": "cs101", "code": "MA101", "name": "Engineering Mathematics I" },
  { "id": "cs102", "code": "PH101", "name": "Physics I" }
]
```

---

### GET `/subjects/:subjectId/units`
List units for a subject, including the current user's progress and material count.

**Example:** `GET /subjects/cs101/units`

**Response `200`**
```json
[
  {
    "id": "u1",
    "number": 1,
    "name": "Differential Calculus",
    "teacher": "Dr. Priya Sharma",
    "materialCount": 5,
    "progress": 88
  },
  {
    "id": "u2",
    "number": 2,
    "name": "Integral Calculus",
    "teacher": "Dr. Priya Sharma",
    "materialCount": 3,
    "progress": 45
  }
]
```

> `id` returns `unit_key` (e.g. `"u1"`) when available — use this as the `unitId` in all other endpoints.

---

### GET `/subjects/:subjectId/home-summary`
Returns progress summary for the Home tab.

**Example:** `GET /subjects/cs101/home-summary`

**Response `200`**
```json
{
  "completedCount": 2,
  "inProgressCount": 1,
  "notStartedCount": 2,
  "totalMaterials": 10,
  "averageProgress": 54
}
```

---

## 3. Materials

### GET `/subjects/:subjectId/materials`
Returns materials grouped by unit.

**Query params**
| Param    | Default | Description                                  |
|----------|---------|----------------------------------------------|
| `type`   | `all`   | Filter: `all` \| `pdf` \| `image` \| `link`  |
| `q`      | —       | Search by filename (case-insensitive)         |
| `unitId` | —       | Filter to one unit (e.g. `u1`)               |

**Example:** `GET /subjects/cs101/materials?type=pdf&unitId=u1`

**Response `200`**
```json
[
  {
    "unitId": "u1",
    "unitName": "Differential Calculus",
    "files": [
      {
        "id": "uuid",
        "name": "Limits and Continuity Notes.pdf",
        "type": "pdf",
        "date": "2026-01-05T10:00:00.000Z",
        "teacher": "Dr. Priya Sharma",
        "size": "2.4 MB",
        "url": null
      },
      {
        "id": "uuid",
        "name": "Calculus Reference Wiki",
        "type": "link",
        "date": "2026-01-06T10:00:00.000Z",
        "teacher": "Dr. Priya Sharma",
        "size": null,
        "url": "https://en.wikipedia.org/wiki/Calculus"
      }
    ]
  }
]
```

---

### POST `/materials`
Upload a new material. Use `multipart/form-data` for file uploads or `application/json` for links.

**Body (form-data for file upload)**
```
subjectId   = cs101
unitId      = u1
name        = My Notes.pdf
type        = pdf
teacherName = Dr. Priya Sharma
file        = <file>
```

**Body (JSON for link)**
```json
{
  "subjectId": "cs101",
  "unitId": "u1",
  "name": "Khan Academy - Calculus",
  "type": "link",
  "externalUrl": "https://khanacademy.org/calculus",
  "teacherName": "Dr. Priya Sharma"
}
```

**Response `201`** — returns the created material record.

> File uploads require S3 env vars (`AWS_BUCKET_NAME`, `AWS_REGION`, etc.) to be configured.

---

### GET `/materials/:materialId/download`
Get a download URL for a material.

- For `link` type → returns the stored `externalUrl`
- For `pdf`/`image` with S3 → returns a signed URL (expires in 1 hour)
- Without S3 → returns the stored `fileUrl`

**Response `200`**
```json
{ "url": "https://..." }
```

---

## 4. Discussion

### GET `/subjects/:subjectId/threads`
List discussion threads with filtering and pagination.

**Query params**
| Param    | Default | Description                                      |
|----------|---------|--------------------------------------------------|
| `q`      | —       | Search in title + description (case-insensitive) |
| `tag`    | —       | Filter by exact tag name                         |
| `unitId` | —       | Filter to one unit (e.g. `u1`)                   |
| `page`   | `1`     | Page number                                      |
| `limit`  | `20`    | Items per page                                   |

**Example:** `GET /subjects/cs101/threads?tag=Help&unitId=u1`

**Response `200`**
```json
[
  {
    "id": "uuid",
    "title": "How do I solve limits with L'Hôpital's rule?",
    "description": "I get stuck when the limit results in 0/0 form...",
    "tags": ["Unit 1", "Differentiation", "Help"],
    "author": { "name": "Arjun Mehta", "avatar": "AM" },
    "upvotes": 28,
    "downvotes": 2,
    "commentCount": 2,
    "timeAgo": "2 hours ago"
  }
]
```

---

### POST `/subjects/:subjectId/threads`
Create a new thread.

**Body**
```json
{
  "title": "My question about integrals",
  "description": "I'm confused about integration by parts...",
  "unitId": "u2",
  "tags": ["Unit 2", "Integration", "Help"]
}
```

**Response `201`**
```json
{ "id": "uuid", "createdAt": "2026-03-01T10:00:00.000Z" }
```

---

### GET `/threads/:threadId`
Get full thread detail with comments and current user's vote.

**Response `200`**
```json
{
  "id": "uuid",
  "title": "How do I solve limits with L'Hôpital's rule?",
  "description": "I get stuck when the limit results in 0/0 form...",
  "tags": ["Unit 1", "Differentiation", "Help"],
  "author": { "name": "Arjun Mehta", "avatar": "AM" },
  "upvotes": 28,
  "downvotes": 2,
  "commentCount": 2,
  "timeAgo": "2 hours ago",
  "myVote": 0,
  "comments": [
    {
      "id": "uuid",
      "text": "L'Hôpital's rule applies when you get 0/0 or ∞/∞...",
      "upvotes": 0,
      "timeAgo": "1 hour ago",
      "author": { "name": "Sneha Patel", "avatar": "SP" }
    }
  ]
}
```

> `myVote` is `1` (upvoted), `-1` (downvoted), or `0` (no vote).

---

### POST `/threads/:threadId/comments`
Add a comment to a thread.

**Body**
```json
{ "text": "This is my answer..." }
```

**Response `201`**
```json
{ "id": "uuid", "createdAt": "2026-03-01T10:00:00.000Z" }
```

---

### PUT `/threads/:threadId/vote`
Vote on a thread. Send `0` to remove an existing vote.

**Body**
```json
{ "vote": 1 }
```
> Allowed values: `1` (upvote), `-1` (downvote), `0` (remove vote)

**Response `200`**
```json
{
  "upvotes": 29,
  "downvotes": 2,
  "myVote": 1
}
```

---

## 5. Quiz

### GET `/subjects/:subjectId/quizzes`
List published quizzes with the current user's last attempt.

**Query params**
| Param        | Default | Description                                      |
|--------------|---------|--------------------------------------------------|
| `difficulty` | `All`   | Filter: `All` \| `Easy` \| `Medium` \| `Hard`    |
| `q`          | —       | Search by quiz name (case-insensitive)           |

**Example:** `GET /subjects/cs101/quizzes?difficulty=Easy`

**Response `200`**
```json
[
  {
    "id": "uuid",
    "unitId": "u1",
    "unitName": "Unit 1",
    "name": "Limits and Continuity Basics",
    "questionCount": 10,
    "timeLimit": 15,
    "difficulty": "Easy",
    "lastAttempt": {
      "scorePercent": 80,
      "correctAnswers": 8,
      "totalQuestions": 10,
      "completedAt": "Feb 28, 2026"
    }
  }
]
```

> `lastAttempt` is `null` if the user has never taken this quiz.

---

### POST `/quizzes/:quizId/attempts/start`
Start a quiz attempt. Returns questions **without correct answers**.

**Response `201`**
```json
{
  "attemptId": "uuid",
  "quiz": {
    "id": "uuid",
    "name": "Limits and Continuity Basics",
    "timeLimitMin": 15
  },
  "questions": [
    {
      "id": "uuid",
      "questionText": "What is lim(x→0) sin(x)/x?",
      "options": ["0", "1", "∞", "undefined"]
    }
  ]
}
```

> Store the `attemptId` — you'll need it to submit.

---

### POST `/quizzes/attempts/:attemptId/submit`
Submit a completed attempt. Scores server-side and updates leaderboard stats.

**Body**
```json
{
  "answers": [
    { "questionId": "uuid-q1", "selectedOptionIndex": 1 },
    { "questionId": "uuid-q2", "selectedOptionIndex": 0 }
  ],
  "timeLeftSeconds": 240
}
```

> `selectedOptionIndex` is the 0-based index into the `options` array returned at start.

**Response `200`**
```json
{
  "scorePercent": 80,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "completedAt": "2026-03-01T10:15:00.000Z"
}
```

---

### GET `/users/me/quiz-attempts`
Get the current user's attempt history.

**Query params**
| Param       | Description                         |
|-------------|-------------------------------------|
| `subjectId` | Filter by subject (e.g. `cs101`)    |
| `quizId`    | Filter by specific quiz UUID        |

**Response `200`**
```json
[
  {
    "id": "uuid",
    "quizId": "uuid",
    "scorePercent": 80,
    "correctAnswers": 8,
    "totalQuestions": 10,
    "submittedAt": "2026-03-01T10:15:00.000Z",
    "timeLeftSeconds": 240
  }
]
```

---

## 6. Leaderboard

### GET `/subjects/:subjectId/leaderboard`
Get ranked leaderboard. `isCurrentUser: true` marks the logged-in user.

**Query params**
| Param    | Default  | Description                               |
|----------|----------|-------------------------------------------|
| `mode`   | `total`  | `total` (subject-wide) \| `unit` (per-unit) |
| `unitId` | —        | Required when `mode=unit` (e.g. `u1`)    |
| `limit`  | `50`     | Max entries to return                     |

**Example:** `GET /subjects/cs101/leaderboard?mode=total&limit=10`

**Response `200`**
```json
[
  {
    "rank": 1,
    "name": "Sneha Patel",
    "avatar": "SP",
    "badge": "Platinum Scholar",
    "score": 2840,
    "quizzesTaken": 18,
    "streak": 14,
    "isCurrentUser": false
  },
  {
    "rank": 2,
    "name": "Arjun Mehta",
    "avatar": "AM",
    "badge": "Platinum Scholar",
    "score": 2200,
    "quizzesTaken": 15,
    "streak": 10,
    "isCurrentUser": true
  }
]
```

**Badge tiers** (based on total points)
| Badge             | Points      |
|-------------------|-------------|
| Platinum Scholar  | 2000+       |
| Gold Scholar      | 1500–1999   |
| Silver Scholar    | 500–1499    |
| Bronze Learner    | 100–499     |
| *(none)*          | 0–99        |

---

## Error Responses

All errors follow this shape:
```json
{ "error": "Human-readable error message" }
```

| Status | Meaning                                   |
|--------|-------------------------------------------|
| `400`  | Bad request / missing required fields     |
| `401`  | Missing or invalid JWT token              |
| `404`  | Resource not found                        |
| `409`  | Conflict (e.g. email already registered)  |
| `500`  | Internal server error                     |

---

## Typical Frontend Flow

```
1. POST /auth/login          → store token in localStorage
2. GET  /semesters           → populate semester picker
3. GET  /semesters/1/subjects → populate subject list
4. GET  /subjects/cs101/units → render Home tab unit cards
5. GET  /subjects/cs101/home-summary → render progress summary

── Materials tab ──────────────────────────────────────────
6. GET  /subjects/cs101/materials → render grouped file list
7. GET  /materials/:id/download  → open/download a file

── Discussion tab ─────────────────────────────────────────
8.  GET  /subjects/cs101/threads → render thread cards
9.  GET  /threads/:id            → open thread detail + comments
10. POST /subjects/cs101/threads → create thread
11. POST /threads/:id/comments   → add comment
12. PUT  /threads/:id/vote       → upvote / downvote

── Quiz tab ───────────────────────────────────────────────
13. GET  /subjects/cs101/quizzes           → render quiz cards
14. POST /quizzes/:id/attempts/start       → begin quiz, store attemptId
15. POST /quizzes/attempts/:id/submit      → submit answers, show result

── Leaderboard tab ────────────────────────────────────────
16. GET  /subjects/cs101/leaderboard       → render rankings
```
