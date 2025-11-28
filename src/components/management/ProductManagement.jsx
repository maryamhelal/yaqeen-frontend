import { useState, useEffect, useContext } from "react";
import { productsAPI } from "../../api/products";
import { AuthContext } from "../../context/AuthContext";
import { tagsAPI } from "../../api/tags";

export default function ProductManagement() {
  const { token, isSuperAdmin } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    salePercentage: 0,
    images: [],
    colors: [],
    category: "",
    collection: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [colorInput, setColorInput] = useState({
    name: "",
    hex: "#000000",
    image: null,
    sizes: [],
  });
  const [sizeInput, setSizeInput] = useState({ size: "", quantity: 0 });
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProductsWithTags = async () => {
      setLoading(true);
      try {
        const result = await productsAPI.getAllProducts();
        let productsData = result.products || [];

        // Map category & collection ids to their names
        const enrichedProducts = await Promise.all(
          productsData.map(async (product) => {
            let categoryName = "";
            let collectionName = "";

            try {
              if (product.category) {
                const cat = await tagsAPI.getTagById(product.category);
                categoryName = cat.name;
              }
              if (product.collection) {
                const coll = await tagsAPI.getTagById(product.collection);
                collectionName = coll.name;
              }
            } catch (err) {
              console.error("Error fetching category/collection:", err);
            }

            return {
              ...product,
              categoryName,
              collectionName,
            };
          })
        );

        setProducts(enrichedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsWithTags();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesData = await tagsAPI.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchCollections = async () => {
    try {
      const categoriesData = await tagsAPI.getCollections();
      setCollections(categoriesData);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setCollections([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCollections();
  }, []);

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleImageChange = (e) => setImageFile(e.target.files[0]);

  // --- Color/Size Management ---
  const handleAddSizeToColor = () => {
    if (!sizeInput.size || sizeInput.quantity <= 0) return;
    setColorInput({
      ...colorInput,
      sizes: [...(colorInput.sizes || []), { ...sizeInput }],
    });
    setSizeInput({ size: "", quantity: 0 });
  };
  const handleDeleteSizeInColor = (idx) => {
    setColorInput({
      ...colorInput,
      sizes: colorInput.sizes.filter((_, i) => i !== idx),
    });
  };
  const handleAddColor = () => {
    if (!colorInput.name || !colorInput.hex || !colorInput.sizes.length) {
      setError("Each color must have a name, a color, and at least one size.");
      return;
    }
    setForm({ ...form, colors: [...form.colors, { ...colorInput }] });
    setColorInput({ name: "", hex: "#000000", image: null, sizes: [] });
    setError("");
  };
  const handleEditColor = (idx) => {
    setColorInput(form.colors[idx]);
    setForm({ ...form, colors: form.colors.filter((_, i) => i !== idx) });
  };
  const handleDeleteColor = (idx) => {
    setForm({ ...form, colors: form.colors.filter((_, i) => i !== idx) });
  };
  const handleColorImageChange = (e) => {
    setColorInput({ ...colorInput, image: e.target.files[0] });
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    setError("");
    setSuccess("");
    // Validation
    if (!form.name || !form.price || !form.category || !form.collection) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!form.colors.length) {
      setError("Please add at least one color with sizes.");
      return;
    }
    for (const color of form.colors) {
      if (!color.sizes || !color.sizes.length) {
        setError(`Color '${color.name}' must have at least one size.`);
        return;
      }
      for (const size of color.sizes) {
        if (!size.size || size.quantity <= 0) {
          setError(
            `Each size for color '${color.name}' must have a name and quantity > 0.`
          );
          return;
        }
      }
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("salePercentage", form.salePercentage);
      formData.append("category", form.category);
      formData.append("collection", form.collection);

      // Colors metadata
      const colorsMetadata = form.colors.map(({ name, hex, sizes }, idx) => ({
        name,
        hex,
        sizes,
        hasImage: !!form.colors[idx].image,
      }));
      formData.append("colors", JSON.stringify(colorsMetadata));

      // Add product image
      if (imageFile) {
        formData.append("image", imageFile); // <-- changed from images
      }

      // Add color images
      form.colors.forEach((color, idx) => {
        if (color.image) {
          formData.append(`colorImages_${idx}`, color.image);
        }
      });

      if (editing) {
        await productsAPI.editProduct(editing, formData, token);
        setSuccess("Product updated successfully!");
      } else {
        await productsAPI.addProduct(formData, token);
        setSuccess("Product created successfully!");
      }

      setEditing(null);
      setForm({
        name: "",
        description: "",
        price: "",
        salePercentage: 0,
        colors: [],
        category: "",
        collection: "",
      });
      setImageFile(null);
      productsAPI.getAllProducts().then((result) => {
        setProducts(result.products || []);
        fetchCategories();
        fetchCollections();
      });
    } catch (error) {
      console.error("Error processing images:", error);
      setError("Error processing images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditing(product._id);
    setForm({
      ...product,
      salePercentage: product.salePercentage || 0,
      image: product.image || "",
      colors: product.colors || [],
    });
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      price: "",
      salePercentage: 0,
      colors: [],
      category: "",
      collection: "",
      sizes: [],
      image: "",
    });
    setImageFile(null);
    setColorInput({ name: "", hex: "#000000", image: null, sizes: [] });
    setSizeInput({ size: "", quantity: 0 });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    await productsAPI.deleteProduct(id, token);
    productsAPI.getAllProducts().then((result) => {
      setProducts(result.products || []);
      fetchCategories();
      fetchCollections();
    });
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const getEffectiveSalePrice = (product) => {
    const salePercentage = product.salePercentage || 0;
    if (salePercentage > 0) {
      return Math.round(product.price * (1 - salePercentage / 100));
    }
    return product.price;
  };

  const handleArchive = async (id, archived) => {
    try {
      await productsAPI.archiveProduct(id, archived, token);
      setSuccess(`Product ${archived ? "archived" : "activated"} successfully`);
      // Refresh products
      productsAPI.getAllProducts().then((result) => {
        setProducts(result.products || []);
        fetchCategories();
        fetchCollections();
      });
    } catch (error) {
      setError("Failed to update product status");
      console.error(error);
    }
  };

  return (
    <div className="px-2 sm:px-4">
      <h2 className="text-2xl font-bold mb-4">Product Management</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Products List */}
      <div className="bg-white p-4 my-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="p-2 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedProducts.length === products.length &&
                      products.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(products.map((p) => p._id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                  />
                </th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Sale</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Collection</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500">
                    {loading ? "Loading products..." : "No products found"}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-b">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleProductSelection(product._id)}
                      />
                    </td>
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">
                      <div>
                        <span
                          className={
                            product.salePercentage > 0
                              ? "line-through text-gray-500"
                              : ""
                          }
                        >
                          {product.price} EGP
                        </span>
                        {product.salePercentage > 0 && (
                          <div className="text-red-600 font-bold">
                            {getEffectiveSalePrice(product)} EGP
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      {product.salePercentage > 0 ? (
                        <p className="font-bold bg-red-100 text-red-800 px-2 py-1 rounded text-xs w-fit">
                          {product.salePercentage}% OFF
                        </p>
                      ) : (
                        <p>{0}</p>
                      )}
                    </td>
                    <td className="p-2">{product.categoryName}</td>
                    <td className="p-2">{product.collectionName}</td>
                    <td className="p-2">
                      {product.archived ? "Archived" : "Active"}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-500 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          const confirmArchive = window.confirm(
                            product.archived
                              ? "Are you sure you want to archive this product?"
                              : "Are you sure you want to activate this product?"
                          );
                          if (confirmArchive) {
                            handleArchive(product._id, !product.archived);
                          }
                        }}
                        className={`text-${
                          product.archived ? "green" : "yellow"
                        }-500 mr-2`}
                      >
                        {product.archived ? "Activate" : "Archive"}
                      </button>
                      {isSuperAdmin() && (
                        <button
                          onClick={() => {
                            const confirmDelete = window.confirm(
                              "Are you sure you want to delete this product?"
                            );
                            if (confirmDelete) {
                              handleDelete(product._id);
                            }
                          }}
                          className="text-red-500"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl shadow mb-8 space-y-4"
      >
        <h3 className="text-lg font-semibold mb-4">Add Product</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleFormChange}
            placeholder="Name"
            className="border p-2 rounded"
            required
          />
          <input
            name="price"
            value={form.price}
            onChange={handleFormChange}
            placeholder="Price"
            type="number"
            className="border p-2 rounded"
            required
          />
          <input
            name="salePercentage"
            value={form.salePercentage}
            onChange={handleFormChange}
            placeholder="Sale %"
            type="number"
            min="0"
            max="100"
            className="border p-2 rounded"
          />
          {/* Category dropdown */}
          <div className="flex items-center space-x-2">
            <select
              name="category"
              value={form.category}
              onChange={handleFormChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Category</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {/* Collection dropdown */}
          <div className="flex items-center space-x-2">
            <select
              name="collection"
              value={form.collection}
              onChange={handleFormChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Collection</option>
              {collections.map((coll, i) => (
                <option key={i} value={coll._id}>
                  {coll.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <textarea
          name="description"
          value={form.description}
          onChange={handleFormChange}
          placeholder="Description"
          className="border p-2 rounded w-full"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border p-2 rounded w-full"
        />

        {/* Colors and sizes */}
        <div className="mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 mb-2">
            <div>
              <input
                placeholder="Color Name"
                value={colorInput.name}
                onChange={(e) =>
                  setColorInput({ ...colorInput, name: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="color"
                value={colorInput.hex}
                onChange={(e) =>
                  setColorInput({ ...colorInput, hex: e.target.value })
                }
                className="border ml-2 p-2 rounded w-10 h-10"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleColorImageChange}
              className="border p-2 rounded flex-1"
            />
            <button
              type="button"
              onClick={handleAddColor}
              className="bg-primary-dark text-white px-4 py-2 rounded"
            >
              Add Color
            </button>
          </div>

          {/* Add sizes */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 mb-2">
            <input
              placeholder="Size"
              value={sizeInput.size}
              onChange={(e) =>
                setSizeInput({ ...sizeInput, size: e.target.value })
              }
              className="border p-2 rounded flex-1"
            />
            <input
              placeholder="Quantity"
              type="number"
              value={sizeInput.quantity}
              onChange={(e) =>
                setSizeInput({
                  ...sizeInput,
                  quantity: parseInt(e.target.value) || 0,
                })
              }
              className="border p-2 rounded flex-1"
            />
            <button
              type="button"
              onClick={handleAddSizeToColor}
              className="bg-primary-dark text-white px-4 py-2 rounded"
            >
              Add Size
            </button>
          </div>

          {colorInput.sizes && colorInput.sizes.length > 0 && (
            <div className="mb-2">
              <p className="font-medium">Sizes for {colorInput.name}:</p>
              {colorInput.sizes.map((size, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <span>
                    {size.size} - {size.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSizeInColor(idx)}
                    className="text-red-500"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Display added colors */}
        {form.colors && form.colors.length > 0 && (
          <div className="mb-4">
            <p className="font-medium">Added Colors:</p>
            {form.colors.map((color, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center space-x-2 mb-2"
              >
                <div
                  style={{
                    backgroundColor: color.hex,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                  }}
                ></div>
                <span>{color.name}</span>
                <span>({color.sizes.length} sizes)</span>
                <button
                  type="button"
                  onClick={() => handleEditColor(idx)}
                  className="text-blue-500"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteColor(idx)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="bg-primary-dark text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          {editing ? "Update Product" : "Add Product"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="bg-gray-300 text-gray-800 px-4 py-2 ml-2 rounded"
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}
