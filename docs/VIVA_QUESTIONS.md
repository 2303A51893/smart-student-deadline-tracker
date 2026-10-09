# 🎓 DeadlineWise — College Viva Examination Guide

> **18 High-Yield Viva Questions and Beginner-Friendly, Easy-to-Memorize Answers**  
> Specially prepared for B.Tech Fullstack Development and DevOps Lab Evaluation (10 Marks).

---

### Q1: What is the primary purpose of the DeadlineWise application?
**Answer:**  
DeadlineWise is a fullstack web application designed for college students to track academic deadlines for **Assignments**, **Exams**, and **Course Projects**. It provides real-time urgency countdowns, prevents missed deadlines, and displays actionable productivity metrics like completion rates.

---

### Q2: What technology stack is used in this project and why?
**Answer:**  
- **Frontend**: React with Vite for fast reactive UI updates and rapid bundling.
- **Styling**: Vanilla CSS with a curated design system (CSS variables, Flexbox, Grid) without external CSS bloat.
- **Backend**: Node.js and Express for an asynchronous, lightweight REST API.
- **Database**: PostgreSQL with the `pg` package for reliable, ACID-compliant relational data persistence.
- **CI/CD**: GitHub Actions for automated testing and production builds.

---

### Q3: Why did you separate `app.js` and `server.js` in the backend?
**Answer:**  
Separating `app.js` from `server.js` is an industry best practice for automated testing:
- **`app.js`** configures middleware and routes without calling `app.listen()`. This allows testing libraries like Supertest to import the app and test endpoints without binding to an actual network port.
- **`server.js`** imports `app.js` and calls `app.listen(PORT)` only when starting the real server process.

---

### Q4: How does the application calculate whether a task is overdue?
**Answer:**  
The calculation uses a pure mathematical rule:
1. If a task is **completed**, it is **never** overdue (even if the due date is in the past).
2. If a task is **uncompleted**, its due date is compared to the current date. If the due date is strictly before today, it is marked as **overdue**.

---

### Q5: How do you prevent SQL Injection in your database queries?
**Answer:**  
We prevent SQL Injection by using **parameterized queries** via the `pg` package (e.g., `SELECT * FROM tasks WHERE id = $1`, `[taskId]`). User inputs are passed as parameters rather than string concatenation, ensuring the PostgreSQL engine treats them strictly as data, never as executable SQL code.

---

### Q6: What is an idempotent database schema, and how is it achieved here?
**Answer:**  
An idempotent operation produces the same result no matter how many times it is run without corrupting data. In our `schema.sql`, we use `CREATE TABLE IF NOT EXISTS tasks (...)` and `CREATE INDEX IF NOT EXISTS ...`. This allows the server to safely verify the table structure on startup without overwriting existing student records.

---

### Q7: What HTTP status codes are used in your REST API?
**Answer:**  
- **`200 OK`**: Successful retrieval, update, or deletion.
- **`201 Created`**: Successful creation of a new deadline or demo seed.
- **`400 Bad Request`**: Validation failure (missing title, invalid date or category).
- **`404 Not Found`**: Requesting or modifying a task ID that does not exist.
- **`500 Internal Server Error`**: Unexpected server-side failure.

---

### Q8: What is the purpose of the `/api/health` endpoint?
**Answer:**  
The `/api/health` endpoint serves as a **liveness and readiness probe**. It checks if the Express server is responsive, inspects database connectivity (`SELECT 1`), and reports memory usage, node version, and system uptime. Cloud orchestrators use this endpoint to monitor container health.

---

### Q9: Why did you choose Node's built-in test runner instead of Jest or Mocha?
**Answer:**  
Node.js (v18+) includes a native test runner (`node:test`) and assertion module (`node:assert`). It is zero-dependency, starts instantly, executes tests natively using standard ES/CommonJS modules, and avoids configuration overhead.

---

### Q10: What is Supertest and how is it used in this project?
**Answer:**  
**Supertest** is an HTTP assertion library for Node.js. It allows us to simulate HTTP requests (`GET`, `POST`, `PUT`, `DELETE`) directly against the Express `app` without having to start a live HTTP network server, making integration tests fast and deterministic.

---

### Q11: What is a Continuous Integration (CI) pipeline?
**Answer:**  
A CI pipeline is an automated workflow that runs whenever code is pushed to version control. In our project, GitHub Actions automatically:
1. Checks out the code.
2. Installs dependencies using `npm ci`.
3. Runs all 32 unit and integration tests.
4. Builds the production frontend bundle (`npm run build`).
5. Audits server syntax.
If any step fails, the pipeline fails and alerts the developer before deployment.

---

### Q12: What is the difference between `npm install` and `npm ci`?
**Answer:**  
- **`npm install`**: Updates dependencies and can overwrite `package-lock.json` if minor version ranges allow it.
- **`npm ci`** (Clean Install): Designed strictly for automated environments like CI/CD. It strictly matches `package-lock.json`, deletes `node_modules` before installing, and errors out if lockfile inconsistencies exist.

---

### Q13: How does your frontend communicate with the backend during development vs. production?
**Answer:**  
- **In Development**: Vite runs on port `5173` and proxies `/api` requests to Express on port `5000` via `vite.config.js`.
- **In Production**: Express serves the built static files (`client/dist`) from the same port as the API (`process.env.PORT`), enabling a single-service deployment on Render.

---

### Q14: How does the application handle responsive web design?
**Answer:**  
We use mobile-first CSS media queries (`@media (max-width: 768px)`), CSS Grid with `repeat(auto-fit, ...)`, and Flexbox. On mobile viewports (e.g. 375px), the sidebar transitions into a collapsible hamburger drawer, and multi-column metric cards stack cleanly in a single column without horizontal overflow.

---

### Q15: Why didn't you include user authentication (JWT/OAuth) in this version?
**Answer:**  
Authentication was intentionally excluded from version 1.0 to keep the classroom demonstration focused, transparent, and easy to grade. Without requiring login credentials, the evaluator can immediately inspect the dashboard, test CRUD operations, and review database persistence. User authentication is documented as a future enhancement.

---

### Q16: What is Neon and how is it used in this architecture?
**Answer:**  
**Neon** is a serverless, hosted PostgreSQL database platform. It provides instant provisioning, connection pooling, and automatic SSL encryption (`sslmode=require`). Our backend connects to Neon via the `DATABASE_URL` environment variable.

---

### Q17: What does the DevOps status section in the application do?
**Answer:**  
The DevOps status section probes `/api/devops/status` to display real-time infrastructure data: API liveness, database connection state, server uptime, and GitHub Actions workflow telemetry. It never fabricates false statuses; if running locally, it honestly indicates that remote CI runs will trigger upon pushing to GitHub.

---

### Q18: What are database indexes and why did you add them to the tasks table?
**Answer:**  
Database indexes are data structures (typically B-trees) that improve the speed of data retrieval operations. We added indexes on `due_date`, `completed`, and `category` because our dashboard frequently filters and sorts tasks by these fields, preventing full table scans as the dataset grows.
