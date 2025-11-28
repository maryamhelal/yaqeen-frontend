const API_BASE_URL = `${
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"
}/api`;

export const productsAPI = {
  // Get all products
  getAllProducts: async (
    page = 1,
    limit = 10,
    category = "",
    collection = ""
  ) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category }),
        ...(collection && { collection }),
      });

      const response = await fetch(`${API_BASE_URL}/products?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch products");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category, page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/products/category/${encodeURIComponent(
          category
        )}?${params}`
      );

      console.log(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch products by category"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  },

  // Get products by collection
  getProductsByCollection: async (collection, page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/products/collection/${encodeURIComponent(
          collection
        )}?${params}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch products by collection"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching products by collection:", error);
      throw error;
    }
  },

  // Get single product by name
  getProductByName: async (name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/name/${name}`);

      if (!response.ok) {
        let errorMessage = "Product not found";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.log(e);
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  // Get single product
  getProduct: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Product not found");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  // Add product (admin)
  addProduct: async (productData, token) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers,
        body: productData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  // Edit product (admin)
  editProduct: async (id, productData, token) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Don't set Content-Type for FormData, let the browser set it with boundary
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers,
        body: productData, // productData is now FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  // Delete product (admin)
  deleteProduct: async (id, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete product");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  // Get all active products
  getActiveProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/active`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch active products");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching active products:", error);
      throw error;
    }
  },

  // Get all archived products
  getArchivedProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/archived`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch archived products");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching archived products:", error);
      throw error;
    }
  },

  // Archive product (admin)
  archiveProduct: async (id, archived, token) => {
    try {
      let response;
      if (archived) {
        response = await fetch(`${API_BASE_URL}/products/unarchive/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to unarchive product");
        }
      } else {
        response = await fetch(`${API_BASE_URL}/products/archive/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to archive product");
        }
      }
      return await response.json();
    } catch (error) {
      console.error("Error archiving product:", error);
      throw error;
    }
  },
};
