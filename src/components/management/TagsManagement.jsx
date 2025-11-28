import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { tagsAPI } from "../../api/tags";

export default function TagsManagement() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("category");
  const [formData, setFormData] = useState({
    name: "",
    tag: "category", // Will be set based on activeTab
    description: "",
    sale: "",
    image: null,
  });
  const [editingTag, setEditingTag] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const [categoriesData, collectionsData] = await Promise.all([
        tagsAPI.getCategories(),
        tagsAPI.getCollections(),
      ]);
      setCategories(categoriesData);
      setCollections(collectionsData);
    } catch (error) {
      setError("Failed to fetch tags");
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else if (name === "sale") {
      // Handle sale field - convert to number or empty string
      const saleValue = value === "" ? "" : parseInt(value) || 0;
      setFormData((prev) => ({ ...prev, [name]: saleValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Tag name is required");
      return;
    }

    try {
      setLoading(true);

      // Set the tag type based on active tab
      const tagData = {
        ...formData,
        tag: activeTab === "category" ? "category" : "collection",
        sale: formData.sale === "" ? 0 : parseInt(formData.sale) || 0,
      };

      if (editingTag) {
        // Update existing tag
        await tagsAPI.updateTag(editingTag.name, tagData, token);
        setSuccess("Tag updated successfully");
      } else {
        // Create new tag
        await tagsAPI.createTag(tagData, token);
        setSuccess("Tag created successfully");
      }

      // Reset form and refresh tags
      setFormData({
        name: "",
        tag: "category",
        description: "",
        sale: "",
        image: null,
      });
      setEditingTag(null);
      setImagePreview(null);
      await fetchTags();
    } catch (error) {
      setError(error.message || "Failed to save tag");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      tag: tag.tag || tag.type || "category",
      description: tag.description || "",
      sale: tag.sale || "",
      image: null, // Reset to null for new file selection
    });
    setImagePreview(tag.image || null);
  };

  const handleDelete = async (tagName, tagType) => {
    if (!window.confirm(`Are you sure you want to delete "${tagName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await tagsAPI.deleteTag(tagName, token);
      setSuccess("Tag deleted successfully");
      await fetchTags();
    } catch (error) {
      setError(error.message || "Failed to delete tag");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setFormData({
      name: "",
      tag: "category",
      description: "",
      sale: "",
      image: null,
    });
    setImagePreview(null);
    setError("");
  };

  const currentTags = activeTab === "category" ? categories : collections;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Tag Management</h2>
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("category")}
          className={`py-2 px-4 font-medium ${
            activeTab === "category"
              ? "border-b-2 border-primary-dark text-primary-dark"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab("collection")}
          className={`py-2 px-4 font-medium ${
            activeTab === "collection"
              ? "border-b-2 border-primary-dark text-primary-dark"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Collections
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          {editingTag ? "Edit Tag" : `Add new ${activeTab}`}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={`Enter ${activeTab} name`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sale Percentage
            </label>
            <input
              type="number"
              name="sale"
              value={formData.sale || ""}
              onChange={handleInputChange}
              min="0"
              max="100"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter sale percentage (0-100)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty or set to 0 for no sale
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>

            {/* Current Image Display */}
            {editingTag && editingTag.image && !imagePreview && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                <img
                  src={editingTag.image}
                  alt={editingTag.name}
                  className="w-24 h-24 object-cover rounded-lg border"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* File Input */}
            <input
              type="file"
              name="image"
              onChange={handleInputChange}
              accept="image/*"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            {/* File Selection Info */}
            {formData.image && (
              <p className="text-sm text-gray-500 mt-1">
                Selected: {formData.image.name}
              </p>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              </div>
            )}

            {/* Clear Image Button */}
            {(formData.image || imagePreview) && (
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, image: null }));
                  setImagePreview(null);
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-700"
              >
                Clear Image
              </button>
            )}
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-dark text-white px-4 py-2 rounded-lg hover:bg-primary-darker transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : editingTag ? "Update Tag" : "Create Tag"}
            </button>

            {editingTag && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tags List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} (
            {currentTags.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : currentTags.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No {activeTab} found. Create your first one above.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentTags.map((tag) => (
              <div
                key={tag._id || tag.name}
                className="p-6 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  {tag.image && (
                    <img
                      src={tag.image}
                      alt={tag.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{tag.name}</h4>
                    {tag.description && (
                      <p className="text-sm text-gray-500">{tag.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-xs text-gray-400 capitalize">
                        Type: {tag.tag}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      {tag.sale && tag.sale > 0 ? (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {tag.sale}% OFF
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(tag)}
                    className="text-primary-dark hover:text-primary-darker transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tag.name, tag.tag || tag.type)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
