const API_BASE_URL = 'http://localhost:8000';

export async function getOfficers() {
  try {
    const response = await fetch(`${API_BASE_URL}/officers`);
    if (!response.ok) {
      throw new Error('Failed to fetch officers');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching officers:', error);
    throw error;
  }
}