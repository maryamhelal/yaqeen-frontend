const API_BASE_URL = `${
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"
}/api`;

export const promocodesAPI = {
  getAllPromocodes: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/promocodes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch promocodes");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching promocodes:", error);
      throw error;
    }
  },
  createPromocode: async (token, promocodeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/promocodes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(promocodeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create promocode");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating promocode:", error);
      throw error;
    }
  },
  updatePromocode: async (token, promocodeId, promocodeData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/promocodes/${promocodeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(promocodeData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update promocode");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating promocode:", error);
      throw error;
    }
  },
  deletePromocode: async (token, promocodeId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/promocodes/${promocodeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete promocode");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting promocode:", error);
      throw error;
    }
  },
  previewPromocode: async (promocodeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/promocodes/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promocodeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to preview promocode");
      }

      return await response.json();
    } catch (error) {
      console.error("Error previewing promocode:", error);
      throw error;
    }
  },
};
