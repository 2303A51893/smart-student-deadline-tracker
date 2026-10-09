/**
 * DeadlineWise API Client
 * Centralized HTTP service for backend interaction.
 */

const API_BASE = '/api';

/**
 * Helper to handle fetch responses and parse errors
 */
async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || (data.errors ? data.errors.join(', ') : 'Network response was not ok');
    throw new Error(errorMsg);
  }
  return data;
}

export async function getTasks(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.sort) params.append('sort', filters.sort);

  const url = `${API_BASE}/tasks${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function getTaskById(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}`);
  return handleResponse(res);
}

export async function createTask(payload) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateTask(id, payload) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function toggleTask(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
    method: 'PATCH',
  });
  return handleResponse(res);
}

export async function deleteTask(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

export async function seedDemoTasks() {
  const res = await fetch(`${API_BASE}/tasks/seed`, {
    method: 'POST',
  });
  return handleResponse(res);
}

export async function getDevOpsStatus() {
  const res = await fetch(`${API_BASE}/devops/status`);
  return handleResponse(res);
}
