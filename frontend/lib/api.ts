const API_URL = "http://127.0.0.1:8000";

export async function getAnalyticsSummary() {
  const response = await fetch(`${API_URL}/analytics/summary`);

  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }

  return response.json();
}

export async function getTasks() {
  const response = await fetch(`${API_URL}/tasks/`);

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return response.json();
}

export async function getImportantTasks() {
  const response = await fetch(`${API_URL}/tasks/important`);

  if (!response.ok) {
    throw new Error("Failed to fetch important tasks");
  }

  return response.json();
}

export async function getTrashTasks() {
  const response = await fetch(`${API_URL}/tasks/trash`);

  if (!response.ok) {
    throw new Error("Failed to fetch trash tasks");
  }

  return response.json();
}