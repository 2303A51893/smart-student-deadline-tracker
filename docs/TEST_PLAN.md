# 🧪 DeadlineWise — Software Test Plan & Execution Report

> **Project**: Smart Student Deadline Tracker ("DeadlineWise")  
> **Testing Framework**: Node.js Built-in Test Runner (`node:test`, `node:assert`) & Supertest  
> **Execution Date**: October 2026  
> **Status**: All 32 Test Cases PASSED (100% Pass Rate)

---

## 1. Test Strategy & Scope
The test suite validates the system across two tiers:
1. **Unit Testing**:
   - Task validation boundaries (required fields, string lengths, enum whitelists, date formats).
   - Task urgency and metrics engine (overdue math, days remaining calculation, completed state immunity).
2. **Integration Testing**:
   - Health and DevOps telemetry endpoints (`/api/health`, `/api/devops/status`).
   - RESTful Task API endpoints (HTTP status codes, database CRUD, search filtering, toggle, and error handling).

---

## 2. Test Execution Summary

| Test Suite File | Type | Test Cases | Passed | Failed | Duration |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `tests/unit/validation.test.js` | Unit | 9 | 9 | 0 | ~11 ms |
| `tests/unit/taskStatus.test.js` | Unit | 8 | 8 | 0 | ~11 ms |
| `tests/integration/health.test.js` | Integration | 4 | 4 | 0 | ~93 ms |
| `tests/integration/tasks.test.js` | Integration | 11 | 11 | 0 | ~242 ms |
| **TOTAL** | **Full Suite** | **32** | **32** | **0** | **~638 ms** |

---

## 3. Detailed Test Cases & Execution Log

### Suite A: Task Input Validation (`tests/unit/validation.test.js`)

| TC ID | Test Description | Input / Precondition | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-VAL-01** | Accept fully valid payload | Valid title, category, priority, due date | `isValid: true`, 0 errors | `isValid: true`, errors: 0 | ✅ PASSED |
| **TC-VAL-02** | Reject missing/empty title | `title: ""` or `title: "   "` | `isValid: false`, title error | `isValid: false`, title error | ✅ PASSED |
| **TC-VAL-03** | Reject title shorter than 3 chars | `title: "Hi"` | `isValid: false`, length error | `isValid: false`, length error | ✅ PASSED |
| **TC-VAL-04** | Reject invalid category string | `category: "UnknownCategory"` | `isValid: false`, category error | `isValid: false`, category error | ✅ PASSED |
| **TC-VAL-05** | Whitelist valid categories | `Assignment`, `Exam`, `Project` | `isValid: true` for all 3 | `isValid: true` for all 3 | ✅ PASSED |
| **TC-VAL-06** | Reject invalid priority string | `priority: "UrgentNow"` | `isValid: false`, priority error | `isValid: false`, priority error | ✅ PASSED |
| **TC-VAL-07** | Whitelist valid priorities | `Low`, `Medium`, `High` | `isValid: true` for all 3 | `isValid: true` for all 3 | ✅ PASSED |
| **TC-VAL-08** | Reject invalid calendar dates | `2026-99-99`, `invalid-date` | `isValid: false`, date error | `isValid: false`, date error | ✅ PASSED |
| **TC-VAL-09** | Validate date parser helper | Non-existent dates (Feb 30) | Returns `false` for invalid dates | Returns `false` for invalid dates | ✅ PASSED |

---

### Suite B: Status & Overdue Calculations (`tests/unit/taskStatus.test.js`)

| TC ID | Test Description | Input / Precondition | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-STAT-01** | Mark past pending task as overdue | `due_date: 2026-10-05`, `completed: false` | `isOverdue: true` | `isOverdue: true` | ✅ PASSED |
| **TC-STAT-02** | Completed tasks never marked overdue | `due_date: 2026-10-01`, `completed: true` | `isOverdue: false` | `isOverdue: false` | ✅ PASSED |
| **TC-STAT-03** | Future task not marked overdue | `due_date: 2026-10-20`, `completed: false` | `isOverdue: false` | `isOverdue: false` | ✅ PASSED |
| **TC-STAT-04** | Task due today not marked overdue | `due_date: 2026-10-10`, `completed: false` | `isOverdue: false` | `isOverdue: false` | ✅ PASSED |
| **TC-STAT-05** | Calculate remaining days accurately | Future, today, and past dates | Returns positive, 0, negative integer | `5`, `0`, `-2` matched | ✅ PASSED |
| **TC-STAT-06** | Decorate task with metadata | Task object | Includes `is_overdue`, `days_remaining` | Metadata fields decorated | ✅ PASSED |
| **TC-STAT-07** | Calculate aggregate metrics | Array of 4 tasks (1 overdue, 2 complete) | `{ total: 4, completed: 2, overdue: 1 }` | Metrics calculated accurately | ✅ PASSED |
| **TC-STAT-08** | Handle empty task array | `tasks: []` | `{ total: 0, pending: 0, ... }` | Zeroed metrics object | ✅ PASSED |

---

### Suite C: Health & Telemetry Probes (`tests/integration/health.test.js`)

| TC ID | Test Description | HTTP Request | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-HLT-01** | API welcome discovery endpoint | `GET /api` | `200 OK`, endpoints dictionary | `200 OK`, matched schema | ✅ PASSED |
| **TC-HLT-02** | Health check liveness probe | `GET /api/health` | `200 OK`, database connected, uptime | `200 OK`, healthy payload | ✅ PASSED |
| **TC-HLT-03** | DevOps telemetry probe | `GET /api/devops/status` | `200 OK`, pipeline metadata | `200 OK`, pipeline telemetry | ✅ PASSED |
| **TC-HLT-04** | Undefined API endpoint error handling | `GET /api/does-not-exist` | `404 Not Found`, JSON error | `404 Not Found`, JSON error | ✅ PASSED |

---

### Suite D: Task CRUD & Workflow (`tests/integration/tasks.test.js`)

| TC ID | Test Description | HTTP Request | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-CRUD-01** | Create valid task | `POST /api/tasks` | `201 Created`, task object | `201 Created`, task object | ✅ PASSED |
| **TC-CRUD-02** | Reject missing title | `POST /api/tasks` (no title) | `400 Bad Request`, validation errors | `400 Bad Request`, error returned | ✅ PASSED |
| **TC-CRUD-03** | Reject invalid category | `POST /api/tasks` (`category: "Hack"`) | `400 Bad Request`, category error | `400 Bad Request`, error returned | ✅ PASSED |
| **TC-CRUD-04** | Reject invalid date | `POST /api/tasks` (`due_date: "abc"`) | `400 Bad Request`, date error | `400 Bad Request`, error returned | ✅ PASSED |
| **TC-CRUD-05** | Retrieve task list with metrics | `GET /api/tasks` | `200 OK`, list and summary metrics | `200 OK`, count and summary | ✅ PASSED |
| **TC-CRUD-06** | Filter tasks by search query | `GET /api/tasks?search=database` | `200 OK`, matched records only | `200 OK`, 1 filtered task | ✅ PASSED |
| **TC-CRUD-07** | Retrieve task by ID or 404 | `GET /api/tasks/1` vs `GET /api/tasks/999` | `200 OK` for existing, `404` for missing | `200` and `404` verified | ✅ PASSED |
| **TC-CRUD-08** | Update task by ID | `PUT /api/tasks/:id` | `200 OK`, updated task object | `200 OK`, fields updated | ✅ PASSED |
| **TC-CRUD-09** | Toggle task completion | `PATCH /api/tasks/:id/toggle` | `200 OK`, flips completed flag | `200 OK`, toggled false ⟷ true | ✅ PASSED |
| **TC-CRUD-10** | Delete task and verify 404 | `DELETE /api/tasks/:id` | `200 OK` on delete, subsequent `404` | `200 OK`, followed by `404` | ✅ PASSED |
| **TC-CRUD-11** | Seed realistic demo deadlines | `POST /api/tasks/seed` | `201 Created`, seeded tasks array | `201 Created`, 6 tasks seeded | ✅ PASSED |

---

## 4. How to Reproduce Test Results
Run the command below in any PowerShell or bash terminal in the project directory:
```powershell
npm test
```
To run specific suites:
```powershell
npm run test:unit
npm run test:integration
```
