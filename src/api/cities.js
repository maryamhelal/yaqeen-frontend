const API_BASE_URL = `${
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"
}/api`;

export const citiesAPI = {
  getCities: async () => {
    const res = await fetch(`${API_BASE_URL}/cities`);
    const data = await res.json();
    return data.data || [];
  },
  getCityAreas: async (cityId) => {
    const res = await fetch(`${API_BASE_URL}/cities/${cityId}/areas`);
    const data = await res.json();
    return data.data || [];
  },
  createCity: async (payload, token) => {
    const res = await fetch(`${API_BASE_URL}/cities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create city");
    return await res.json();
  },
  updateCity: async (cityId, payload, token) => {
    const res = await fetch(`${API_BASE_URL}/cities/${cityId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update city");
    return await res.json();
  },
  deleteCity: async (cityId, token) => {
    const res = await fetch(`${API_BASE_URL}/cities/${cityId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to delete city");
    return await res.json();
  },
};
