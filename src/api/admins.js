const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api`;

export const adminsAPI = {
  // Get all admins (Superadmin only)
  getAllAdmins: async (token, page = 1, limit = 10, role = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(role && { role }),
      });

      const response = await fetch(`${API_BASE_URL}/admins?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch admins');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  },

  // Create new admin (Superadmin only)
  createAdmin: async (adminData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(adminData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create admin');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  },

  // Update admin (Superadmin only)
  updateAdmin: async (adminId, adminData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(adminData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update admin');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating admin:', error);
      throw error;
    }
  },

  // Delete admin (Superadmin only)
  deleteAdmin: async (adminId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete admin');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  },
};
