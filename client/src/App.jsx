import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import SummaryCards from './components/SummaryCards';
import TaskFilterToolbar from './components/TaskFilterToolbar';
import TaskList from './components/TaskList';
import TaskFormModal from './components/TaskFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import DevOpsModal from './components/DevOpsModal';
import * as api from './services/api';

export default function App() {
  // Task State
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('all');
  const [activePriority, setActivePriority] = useState('All');
  const [sortBy, setSortBy] = useState('deadline_asc');

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDevOpsModalOpen, setIsDevOpsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // DevOps Telemetry State
  const [devOpsStatus, setDevOpsStatus] = useState(null);

  // Mobile Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch tasks
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const res = await api.getTasks({
        search: searchQuery,
        category: activeCategory,
        status: activeStatus,
        priority: activePriority,
        sort: sortBy,
      });
      if (res.success) {
        setTasks(res.data || []);
        if (res.summary) {
          setSummary(res.summary);
        }
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setApiError(err.message || 'Unable to connect to database backend.');
      addToast(err.message || 'Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeCategory, activeStatus, activePriority, sortBy]);

  // Fetch telemetry
  const loadDevOpsStatus = useCallback(async () => {
    try {
      const res = await api.getDevOpsStatus();
      if (res.success) {
        setDevOpsStatus(res);
      }
    } catch (err) {
      console.warn('DevOps probe returned error:', err.message);
    }
  }, []);

  // Initial mount load
  useEffect(() => {
    loadTasks();
    loadDevOpsStatus();
  }, [loadTasks, loadDevOpsStatus]);

  // Handle Create or Update
  const handleSaveTask = async (formData) => {
    try {
      setIsSubmitting(true);
      if (formData.id) {
        // Update
        const res = await api.updateTask(formData.id, formData);
        addToast(`Updated "${res.data.title}"`, 'success');
      } else {
        // Create
        const res = await api.createTask(formData);
        addToast(`Created new deadline: "${res.data.title}"`, 'success');
      }
      setIsFormModalOpen(false);
      setEditingTask(null);
      await loadTasks();
    } catch (err) {
      addToast(err.message || 'Failed to save deadline', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Toggle Complete
  const handleToggleTask = async (id) => {
    try {
      const res = await api.toggleTask(id);
      addToast(res.message || 'Task status updated', 'info');
      await loadTasks();
    } catch (err) {
      addToast(err.message || 'Failed to toggle status', 'error');
    }
  };

  // Handle Delete
  const handleConfirmDelete = async (id) => {
    try {
      setIsDeleting(true);
      const res = await api.deleteTask(id);
      addToast(res.message || 'Deadline deleted', 'info');
      setDeletingTask(null);
      await loadTasks();
    } catch (err) {
      addToast(err.message || 'Failed to delete deadline', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Seed Demo Data
  const handleSeedDemoData = async () => {
    try {
      setIsSeeding(true);
      const res = await api.seedDemoTasks();
      addToast(res.message || 'Seeded realistic college demo deadlines!', 'success');
      await loadTasks();
    } catch (err) {
      addToast(err.message || 'Failed to seed sample deadlines', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        taskCounts={summary}
        onOpenDevOpsModal={() => setIsDevOpsModalOpen(true)}
        onSeedDemoData={handleSeedDemoData}
        isSeeding={isSeeding}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-layout">
        {/* Top Header Bar */}
        <TopBar
          onOpenCreateModal={() => {
            setEditingTask(null);
            setIsFormModalOpen(true);
          }}
          onOpenDevOpsModal={() => setIsDevOpsModalOpen(true)}
          devOpsStatus={devOpsStatus}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />

        {/* Dashboard Content */}
        <main className="dashboard-content">
          {/* Global API Error Alert */}
          {apiError && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '14px 18px',
                marginBottom: '20px',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>Connection Alert:</strong> {apiError}
              </div>
              <button
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={loadTasks}
              >
                Retry
              </button>
            </div>
          )}

          {/* Metric Summary Cards */}
          <SummaryCards
            summary={summary}
            activeStatus={activeStatus}
            onSelectStatus={setActiveStatus}
          />

          {/* Filtering and Search Toolbar */}
          <TaskFilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            activePriority={activePriority}
            onPriorityChange={setActivePriority}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Task List */}
          <TaskList
            tasks={tasks}
            loading={loading}
            onToggleTask={handleToggleTask}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsFormModalOpen(true);
            }}
            onDeleteTask={(task) => setDeletingTask(task)}
            onOpenCreateModal={() => {
              setEditingTask(null);
              setIsFormModalOpen(true);
            }}
            onSeedDemoData={handleSeedDemoData}
          />
        </main>
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTask)}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* DevOps Status Modal */}
      <DevOpsModal
        isOpen={isDevOpsModalOpen}
        onClose={() => setIsDevOpsModalOpen(false)}
        devOpsStatus={devOpsStatus}
        onRefresh={() => {
          loadDevOpsStatus();
          addToast('System telemetry refreshed', 'info');
        }}
      />

      {/* Toast Notification Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-pill ${t.type}`}>
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '⚠️' : 'ℹ️'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
