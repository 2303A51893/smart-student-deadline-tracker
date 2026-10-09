/**
 * Database Seed Script
 * Populates realistic college student demo deadlines.
 * Clearly identified as demo data for classroom presentation.
 */

const { query, initDb, close } = require('./index');

const DEMO_TASKS = [
  {
    title: '[Demo] DSA Lab 4: AVL Trees & Heap Implementation',
    description: 'Implement balance factor calculations and tree rotations in C++/Java with time complexity analysis.',
    category: 'Assignment',
    priority: 'High',
    daysOffset: 2, // due in 2 days
    completed: false,
  },
  {
    title: '[Demo] Cloud & DevOps Capstone Project Submission',
    description: 'Finalize GitHub Actions workflow, Docker containerization, and Render deployment for course project.',
    category: 'Project',
    priority: 'High',
    daysOffset: 7, // due in 7 days
    completed: false,
  },
  {
    title: '[Demo] Database Management Systems Midterm Exam',
    description: 'Review normalization (1NF to BCNF), indexing, transactions, ACID properties, and query optimization.',
    category: 'Exam',
    priority: 'High',
    daysOffset: 4, // due in 4 days
    completed: false,
  },
  {
    title: '[Demo] Computer Networks: TCP Socket Programming',
    description: 'Create multi-threaded client-server communication application in Python/Node.',
    category: 'Assignment',
    priority: 'Medium',
    daysOffset: -4, // completed earlier
    completed: true,
  },
  {
    title: '[Demo] Operating Systems: Process Synchronization Quiz',
    description: 'Semaphores, Mutex, Dining Philosophers problem, and deadlock prevention algorithms.',
    category: 'Exam',
    priority: 'Medium',
    daysOffset: -2, // due 2 days ago (overdue demo)
    completed: false,
  },
  {
    title: '[Demo] Web Engineering: Fullstack Microservices Design',
    description: 'Draft REST API architecture documentation, entity relationship diagrams, and frontend mockups.',
    category: 'Project',
    priority: 'Low',
    daysOffset: 12, // due in 12 days
    completed: false,
  },
];

/**
 * Generates an ISO date string offset from today by N days
 * @param {number} offsetDays
 * @returns {string} YYYY-MM-DD
 */
function getOffsetDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function runSeed() {
  console.log('[Seed]: Ensuring database schema exists...');
  await initDb();

  console.log('[Seed]: Inserting realistic demo college tasks...');
  const insertedTasks = [];

  for (const item of DEMO_TASKS) {
    const dueDate = getOffsetDate(item.daysOffset);
    const sql = `
      INSERT INTO tasks (title, description, category, priority, due_date, completed)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const result = await query(sql, [
      item.title,
      item.description,
      item.category,
      item.priority,
      dueDate,
      item.completed,
    ]);
    if (result.rows && result.rows[0]) {
      insertedTasks.push(result.rows[0]);
    }
  }

  console.log(`[Seed]: Successfully seeded ${insertedTasks.length} demo student tasks.`);
  return insertedTasks;
}

if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('[Seed]: Complete!');
      return close();
    })
    .catch((err) => {
      console.error('[Seed Error]:', err.message);
      process.exit(1);
    });
}

module.exports = {
  runSeed,
  DEMO_TASKS,
  getOffsetDate,
};
