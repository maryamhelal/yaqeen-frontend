const API_BASE_URL = `${
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"
}/api`;

export const messagesAPI = {
  // Create new message
  createMessage: async (messageData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create message");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  },

  // Get all messages (Admin only)
  getAllMessages: async (token, page = 1, limit = 10, status = "") => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
      });

      const response = await fetch(`${API_BASE_URL}/messages?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch messages");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },

  // Get messages by user email
  getUserMessages: async (userEmail, page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/messages/${encodeURIComponent(userEmail)}?${params}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user messages");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user messages:", error);
      throw error;
    }
  },

  // Resolve a message (Admin only)
  resolveMessage: async (messageId, token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/messages/resolve/${messageId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        // Try to parse JSON error body, but fall back to text if HTML/other
        let errorText;
        try {
          const errorData = await response.json();
          errorText = errorData.error || JSON.stringify(errorData);
        } catch (e) {
          errorText = await response.text();
        }
        throw new Error(errorText || "Failed to resolve message");
      }

      // Parse success body safely
      try {
        return await response.json();
      } catch (e) {
        const text = await response.text();
        return { success: true, data: text };
      }
    } catch (error) {
      console.error("Error resolving message:", error);
      throw error;
    }
  },
};
