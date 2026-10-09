# ⏱️ DeadlineWise — Smart Student Deadline Tracker

> **A Production-Style Fullstack & DevOps Academic Project for B.Tech Evaluation (10 Marks)**  
> Built with **React (Vite)**, **Node.js / Express REST API**, **PostgreSQL (`pg`)**, and automated **GitHub Actions CI/CD**.

[![Node.js LTS](https://img.shields.io/badge/node-v20%2B-brightgreen.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/database-PostgreSQL%2016%2B%20%2F%20Neon-blue.svg)](https://neon.tech/)
[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb.svg)](https://vitejs.dev/)
[![CI Pipeline](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF.svg)](https://github.com/features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 1. Project Title & Overview

**DeadlineWise** is an intuitive, modern, and reliable student productivity platform engineered to help university students manage assignments, examination dates, and course project milestones.

Unlike generic to-do apps, **DeadlineWise** solves the core challenges of academic scheduling:
- Tracks strict submission deadlines with real-time urgency countdowns (`Due today`, `Due in X days`, `Overdue by X days`).
- Classifies work across standardized college categories: **Assignments**, **Exams / Quizzes**, and **Course Projects**.
- Employs deterministic deadline and overdue logic where completed submissions never flag false alarms.
- Integrates production-grade DevOps automation (continuous integration pipelines, container-ready micro-architecture, and environment-driven configurations).

---

## 🎯 2. Problem Statement & Objectives

### The Problem
College students juggle simultaneous coursework across multiple subjects with disparate submission platforms (Google Classroom, Moodle, email submissions, laboratory evaluations). This leads to:
1. Missed lab cutoffs and penalizing late submissions.
2. Fragmented tracking on disorganized scratchpads or chat threads.
3. Lack of unified visibility into project vs. examination priorities.

### Project Objectives
- **Fullstack Integration**: Develop a decoupled RESTful architecture with a React single-page frontend and Express.js backend.
- **Relational Persistence**: Model an idempotent PostgreSQL schema using the native Node `pg` client with parameterized SQL queries.
- **Academic Urgency Engine**: Implement pure status algorithms calculating pending, completed, overdue, and overall completion percentages.
- **DevOps Best Practices**: Automate dependency auditing, test execution, syntax verification, and client bundling using GitHub Actions.
- **Production Readiness**: Provide single-service static asset delivery suitable for platforms like Render and serverless PostgreSQL hosts such as Neon.

---

## 🛠️ 3. Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Blazing fast HMR, reactive component state, and optimized production bundling. |
| **Styling** | Custom Vanilla CSS (Design System) | Deep navy/indigo palette, micro-transitions, responsive flex/grid layouts, no heavy CSS dependencies. |
| **Backend API** | Node.js (v20+) & Express.js | Lightweight asynchronous event-driven runtime; clean REST routing. |
| **Database** | PostgreSQL (`pg` pool) | ACID compliance, strong constraints, and hosted support (Neon / Supabase / Render). |
| **Testing** | Node.js Test Runner (`node:test`, `node:assert`) + Supertest | Native zero-dependency unit and HTTP integration testing. |
| **Version Control** | Git & GitHub | Branch-based collaboration and traceability. |
| **CI / Automation** | GitHub Actions (`.github/workflows/ci.yml`) | Automated checkout, lint/syntax checks, test execution, and production builds on push/PR. |
| **Deployment** | Render Web Service + Neon PostgreSQL | Free-tier compatible dual-tier deployment architecture. |

---

## 🏛️ 4. Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Client Layer (Browser)"]
        UI["React Single Page Application (Vite)"]
        State["State Hooks & Filter Engine"]
        APIClient["services/api.js (Fetch API)"]
    end

    subgraph Server ["Backend Layer (Node.js & Express)"]
        Proxy["Static Asset Middleware (client/dist)"]
        Router["Express Router (/api)"]
        TaskCtrl["Task Controller & Validator"]
        StatusUtil["Urgency & Metrics Engine"]
        HealthCtrl["Health & DevOps Telemetry"]
    end

    subgraph Database ["Persistence Layer"]
        PGPool["pg Connection Pool"]
        Postgres[("PostgreSQL Database\n(Neon Cloud / Local)")]
    end

    subgraph DevOps ["DevOps & CI/CD Layer"]
        GHActions["GitHub Actions CI Pipeline"]
        RenderService["Render Web Service"]
    end

    UI --> State
    State --> APIClient
    APIClient -->|HTTP REST / JSON| Router
    UI -.->|Static HTTP GET| Proxy

    Router --> TaskCtrl
    Router --> HealthCtrl
    TaskCtrl --> StatusUtil
    TaskCtrl --> PGPool
    HealthCtrl --> PGPool
    PGPool -->|Parameterized SQL| Postgres

    GHActions -->|Lint, Test, Build| Server
    RenderService -->|Hosts Unified Server| Server
```

---

## 📁 5. Repository Structure

```text
smart-deadline-tracker/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Automated GitHub Actions CI workflow
├── client/                        # React Frontend (Vite)
│   ├── public/
│   │   └── favicon.svg            # DeadlineWise brand favicon
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   ├── DevOpsModal.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SummaryCards.jsx
│   │   │   ├── TaskFilterToolbar.jsx
│   │   │   ├── TaskFormModal.jsx
│   │   │   ├── TaskList.jsx
│   │   │   └── TopBar.jsx
│   │   ├── services/
│   │   │   └── api.js             # Centralized REST client
│   │   ├── styles/
│   │   │   └── index.css          # Design system, CSS variables & typography
│   │   ├── App.css
│   │   ├── App.jsx                # Main application state orchestrator
│   │   ├── index.css
│   │   └── main.jsx               # React DOM entrypoint
│   ├── index.html                 # HTML shell with Google Fonts & SEO tags
│   ├── package.json               # Frontend dependencies & scripts
│   └── vite.config.js             # Vite configuration with /api reverse proxy
├── docs/                          # College Submission Deliverables
│   ├── DEMO_SCRIPT.md             # 2-minute classroom demo script
│   ├── PROJECT_REPORT.md          # Comprehensive formal college project report
│   ├── TEST_PLAN.md               # Complete test cases & results log
│   └── VIVA_QUESTIONS.md          # 15+ viva questions & student-ready answers
├── src/                           # Express REST Backend
│   ├── controllers/
│   │   └── taskController.js      # CRUD, filtering, sorting, status calculation
│   ├── db/
│   │   ├── index.js               # PostgreSQL pool & test memory fallback
│   │   ├── schema.sql             # Idempotent table & index definitions
│   │   └── seed.js                # Realistic academic demo data seeder
│   ├── routes/
│   │   ├── healthRoutes.js        # /api/health and /api/devops/status
│   │   └── taskRoutes.js          # /api/tasks REST endpoints
│   ├── utils/
│   │   └── taskStatus.js          # Pure overdue calculations & dashboard metrics
│   ├── validation/
│   │   └── taskValidator.js       # Strict category, priority, and date validator
│   ├── app.js                     # Express app instance (without app.listen)
│   └── server.js                  # HTTP server bootstrap & graceful shutdown
├── tests/                         # Automated Test Suite (node:test + supertest)
│   ├── integration/
│   │   ├── health.test.js         # API health & DevOps probe tests
│   │   └── tasks.test.js          # End-to-end CRUD, search, filter, and error tests
│   └── unit/
│       ├── taskStatus.test.js     # Overdue math, date diffs, metrics testing
│       └── validation.test.js     # Input constraints and validation rules
├── .env.example                   # Annotated template for environment variables
├── .gitignore                     # Git exclusion rules
├── package.json                   # Root dependencies, scripts, and engine specifications
└── README.md                      # Comprehensive project documentation
```

---

## ⚡ 6. Quick Start & Local Setup (Windows & VS Code)

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ LTS recommended). Check via `node -v`.
- **Git**: Installed. Check via `git -v`.
- **PostgreSQL**: Either local PostgreSQL (port 5432) OR a free [Neon](https://neon.tech/) cloud database URL.

### Step 1: Clone or Open Workspace
Open the project directory in VS Code:
```powershell
cd "c:\Users\Venkata Ramana\Desktop\smart-deadline-tracker"
```

### Step 2: Install Dependencies
Install dependencies for both the root backend and the client:
```powershell
# Installs root backend dependencies
npm install

# Installs React Vite frontend dependencies
npm --prefix client install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```
Open `.env` in VS Code and adjust your database connection:
- If using **Neon Cloud**:
  ```env
  DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-sample.region.neon.tech/neondb?sslmode=require
  ```
- If using **Local PostgreSQL**:
  ```env
  DATABASE_URL=postgresql://postgres:YOUR_LOCAL_PASSWORD@localhost:5432/deadlinewise
  ```

### Step 4: Run Database Initialization & Demo Seed
Initialize the schema and seed sample deadlines:
```powershell
npm run db:init
npm run seed
```

### Step 5: Start Development Mode
Run both the Express backend (`localhost:5000`) and the Vite React server (`localhost:5173`) concurrently:
```powershell
npm run dev
```
Open your browser to: **`http://localhost:5173`** (Vite proxies all `/api` calls directly to port 5000).

---

## 📡 7. API Endpoint Reference

| Method | Endpoint | Description | Sample Request / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Liveness/readiness probe; checks DB connection & memory | None |
| `GET` | `/api/devops/status` | Real-time CI/CD telemetry, Git commit, uptime | None |
| `GET` | `/api/tasks` | Lists all tasks with calculated metrics & filters | `?search=dsa&category=Assignment&status=pending` |
| `GET` | `/api/tasks/:id` | Retrieves a single deadline record | `GET /api/tasks/1` |
| `POST` | `/api/tasks` | Creates a new deadline (validates title, category, date) | `{"title":"OS Lab","category":"Assignment","due_date":"2026-10-30"}` |
| `PUT` | `/api/tasks/:id` | Updates an existing deadline record | `{"title":"Updated","category":"Exam","due_date":"2026-11-02"}` |
| `PATCH` | `/api/tasks/:id/toggle` | Toggles completed state (`true` ⟷ `false`) | None |
| `DELETE` | `/api/tasks/:id` | Permanently deletes a deadline | None |
| `POST` | `/api/tasks/seed` | Seeds realistic academic demo deadlines | None |

---

## 🧪 8. Automated Testing

The project uses the **Node.js built-in test runner (`node:test`)** and **Supertest** for fast, reliable, zero-dependency testing.

### Running Tests
```powershell
# Run the complete test suite (32 tests across 4 test suites)
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

### What Is Tested?
- ✅ **Task Validation**: Title missing/too short/too long, category whitelist (`Assignment`, `Exam`, `Project`), priority whitelist, and valid calendar dates.
- ✅ **Urgency & Overdue Mathematics**: Ensures completed tasks are **never** flagged overdue; past pending tasks are flagged overdue; calculates relative days remaining accurately.
- ✅ **API Health & Probe**: Validates 200 responses, uptime counter, and database health payload.
- ✅ **Full CRUD Workflow**: Task creation (201), retrieval (200), updating (200), toggle (200), deletion (200), 404 on missing tasks, and 400 on malformed payloads.

---

## 🔄 9. DevOps & CI/CD Pipeline (GitHub Actions)

A GitHub Actions workflow is pre-configured at [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

### Pipeline Workflow Steps
1. **Trigger**: Executes on every `push` to `main` and on all `pull_request` events targeting `main`.
2. **Environment**: Provisions `ubuntu-latest` running **Node.js 20 LTS**.
3. **Clean Installation**: Executes `npm ci` and `npm --prefix client ci` ensuring immutable dependency lockfile compliance.
4. **Automated Testing**: Executes `npm test` running all 32 unit and integration test assertions.
5. **Production Build**: Executes `npm run build` compiling React and Vite assets into minified production files under `client/dist`.
6. **Artifact & Syntax Verification**: Confirms `client/dist/index.html` was generated and verifies server syntax with `node --check`.

### Interpreting Pipeline Status
- 🟢 **Green Checkmark (Passed)**: Code compiles cleanly, all tests passed, and client build completed without regressions. Safe to deploy.
- 🔴 **Red Cross (Failed)**: Either a test assertion failed, syntax had an error, or package dependencies failed auditing. Click into the GitHub Actions run to inspect the specific step log.

---

## 🌐 10. Free-Tier Deployment Guide (Render + Neon)

DeadlineWise is engineered for a **single-service web deployment** on Render paired with a serverless PostgreSQL instance on Neon.

### Architecture on Cloud
- **Neon Cloud**: Hosts managed PostgreSQL (free tier provides 0.5 GB storage, serverless compute).
- **Render Web Service**: Builds the React client and runs the Express backend on a single dynamic port (`process.env.PORT`). Express serves both `/api` endpoints and the static SPA frontend (`client/dist`).

### Step-by-Step Deployment Instructions

#### 1. Setup PostgreSQL Database on Neon
1. Create a free account at [https://neon.tech](https://neon.tech).
2. Create a new project named `deadlinewise-db`.
3. Copy the connection string (it will look like: `postgresql://user:pass@ep-xyz.region.neon.tech/neondb?sslmode=require`).

#### 2. Push Workspace to GitHub
```powershell
git add .
git commit -m "feat: complete Smart Student Deadline Tracker project"
git remote add origin https://github.com/YOUR_USERNAME/smart-student-deadline-tracker.git
git branch -M main
git push -u origin main
```

#### 3. Create Web Service on Render
1. Sign in to [Render](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Name**: `deadlinewise-app`
   - **Environment**: `Node`
   - **Region**: Nearest to your database
   - **Branch**: `main`
   - **Build Command**: `npm install && npm --prefix client install && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: *(Paste your Neon connection URI)*

#### 4. Verify Cloud Deployment
Once deployed, Render provides a public URL (e.g. `https://deadlinewise-app.onrender.com`).
- Visiting `/api/health` will return `{"status":"healthy","database":{"connected":true,"provider":"Neon PostgreSQL"}}`.
- Visiting `/` loads the React frontend with all assets served seamlessly.

> **Provider Notice**: Render free-tier web services spin down after 15 minutes of inactivity and take ~50 seconds to wake up on the first incoming request. This is standard free-tier behavior.

---

## 📸 11. Screenshots Checklist for Submission

For your final lab evaluation or project report, capture the following screenshots:
- [ ] **Desktop Dashboard**: Showing the navy sidebar, metrics cards, progress bar, and active deadlines.
- [ ] **Task Creation Modal**: Showing input fields, category selector, and priority options.
- [ ] **Filtering in Action**: Filtered view displaying only "Assignments" or "Pending" items.
- [ ] **DevOps & Pipeline Modal**: Displaying live API health and CI configuration telemetry.
- [ ] **Mobile Responsiveness**: Viewport resized to mobile width showing the responsive single-column layout and hamburger drawer.
- [ ] **Terminal Test Run**: Output of `npm test` showing all 32 tests passing with 0 failures.

---

## ⚖️ 12. Limitations & Future Scope

### Current Limitations
- **Classroom Demo Scope**: Single-user design intended for individual student productivity and classroom evaluation; user authentication (JWT/OAuth) is omitted in v1.0 to keep the demonstration transparent and focused.
- **Provider Cold Starts**: Free-tier cloud instances experience initial spin-up latency.

### Future Enhancements
- **Calendar & Gantt View**: Visual timeline representation of semester workload.
- **Multi-User Authentication**: Role-based access with student and professor portals.
- **Push & Email Notifications**: Automated reminder triggers 24 hours prior to deadline cutoffs.

---

## 🏁 13. Conclusion

**DeadlineWise** showcases end-to-end fullstack engineering principles: from resilient database schema design and pure status mathematics to a polished, accessible UI and automated continuous integration. It fulfills all requirements for the B.Tech Fullstack and DevOps curriculum evaluation.
