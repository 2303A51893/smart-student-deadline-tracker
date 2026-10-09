# ⏱️ DeadlineWise — 2-Minute Classroom Demonstration Script

> **A Timed, Confident Walkthrough for College Faculty Evaluation**  
> Designed for a 120-second live demonstration in front of your professor or evaluator.

---

### Pre-Demo Checklist (30 seconds before you start)
1. Ensure the terminal is open in the project root: `cd "c:\Users\Venkata Ramana\Desktop\smart-deadline-tracker"`.
2. Start the development server: `npm run dev`.
3. Open Google Chrome to `http://localhost:5173`.
4. Keep a second terminal tab open ready to run `npm test`.

---

### Sequence Breakdown (Total Duration: 2 Minutes)

#### 🕒 0:00 – 0:30: Introduction & Dashboard Overview
* **Action**: Display the dashboard on screen.
* **Speaker Script**:
  > *"Good morning, Professor. Today I am presenting **DeadlineWise**, a smart academic deadline tracker built specifically for university students.*
  > *Students frequently juggle assignments, exams, and projects across multiple subjects. Here on the dashboard, you can see our product branding, live semester date, and summary cards tracking total deadlines, pending work, completed submissions, and overdue alerts, accompanied by an interactive completion rate progress bar."*

---

#### 🕒 0:30 – 0:50: Creating and Validating a New Deadline
* **Action**: Click the **"+ New Deadline"** button in the top bar. Enter a test deadline:
  - Title: `Operating Systems Lab 5: Mutex & Semaphores`
  - Category: `Assignment`
  - Priority: `High`
  - Due Date: Select a date 3 days from today.
  - Click **"Create Deadline"**.
* **Speaker Script**:
  > *"Let's add an urgent lab assignment. Notice our modal includes strict client and server validation. When submitted, the backend validates the payload, executes a parameterized SQL query into PostgreSQL, and immediately calculates the urgency badge—displaying 'Due in 3 days' with a high priority indicator."*

---

#### 🕒 0:50 – 1:15: Interactive Filtering, Urgency Logic & Completion
* **Action**: 
  1. Click **"Assignments"** in the sidebar to filter the view.
  2. Click the completion checkbox on the newly created assignment.
  3. Observe that the progress bar increases and the task marks as submitted.
* **Speaker Script**:
  > *"The sidebar enables one-click filtering between Assignments, Exams, and Projects. When I mark this assignment as complete, our status calculation engine immediately updates our completion rate. Crucially, as per our requirements, completed tasks are mathematically protected from ever being flagged as overdue, preventing false alarms."*

---

#### 🕒 1:15 – 1:35: DevOps Telemetry & Health Probe
* **Action**: Click the green **"API & DB Online"** status pill in the top bar.
* **Speaker Script**:
  > *"Beyond fullstack functionality, this project incorporates enterprise DevOps standards. Clicking our status pill exposes our live `/api/devops/status` telemetry.*
  > *It displays our REST API health, live server uptime, database connection state, and our GitHub Actions continuous integration workflow. This ensures complete observability without fabricating any mock pipeline states."*
* **Action**: Close the telemetry modal.

---

#### 🕒 1:35 – 2:00: Automated Testing & Continuous Integration
* **Action**: Switch to the terminal and execute:
  ```powershell
  npm test
  ```
  *(Point to the output showing 32 passed tests in ~600ms).*
* **Speaker Script**:
  > *"Finally, to verify code quality, we have 32 automated tests running via Node's native test runner and Supertest. These tests rigorously validate input schemas, overdue logic, and all CRUD endpoints.*
  > *Every code push to GitHub triggers our GitHub Actions pipeline, which automatically installs dependencies with `npm ci`, runs these tests, and builds the production React bundle.*
  > *Thank you, Professor. I am ready for questions."*

---

### Emergency Fallback Tips
- **If the database is offline**: The frontend displays a clean connection diagnostic alert banner and status pill turns amber (`System Diagnostic`), demonstrating resilient error handling rather than crashing.
- **To reset demo data at any time**: Click the **"✨ Load Demo Data"** button in the sidebar.
