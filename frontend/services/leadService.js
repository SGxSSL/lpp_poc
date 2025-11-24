const API_BASE_URL = "http://localhost:8000";

export async function getAllLeads() {
  const response = await fetch(`${API_BASE_URL}/leads`);
  if (!response.ok) {
    throw new Error("Failed to fetch leads");
  }
  return response.json();
}

export async function getLead(id) {
  const response = await fetch(`${API_BASE_URL}/leads/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch lead");
  }
  return response.json();
}

export async function getLeadDetails(id) {
  const response = await fetch(`${API_BASE_URL}/leads/${id}/details`);
  if (!response.ok) {
    throw new Error("Failed to fetch lead details");
  }
  return response.json();
}

export async function getDashboardData() {
  const response = await fetch(`${API_BASE_URL}/dashboard`);
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return response.json();
}

export async function analyzeLead(id) {
  const response = await fetch(`${API_BASE_URL}/leads/${id}/analyze`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to analyze lead");
  }
  return response.json();
}
