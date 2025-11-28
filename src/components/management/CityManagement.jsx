import { useState, useEffect } from "react";
import { citiesAPI } from "../../api/cities";
import { useAuth } from "../../context/AuthContext";

export default function CityManagement() {
  const { token } = useAuth();
  const [cities, setCities] = useState([]);
  const [editingCity, setEditingCity] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", areas: [] });
  const [areaInput, setAreaInput] = useState("");
  const [editingAreaIdx, setEditingAreaIdx] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await citiesAPI.getCities();
      setCities(res);
      setError("");
    } catch (err) {
      setError("Failed to fetch cities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleEdit = (city) => {
    setEditingCity(city._id);
    setForm({
      name: city.name,
      price: city.price,
      areas: Array.isArray(city.areas) ? [...city.areas] : [],
    });
    setAreaInput("");
    setEditingAreaIdx(null);
  };

  const handleDelete = async (cityId) => {
    setLoading(true);
    setError("");
    try {
      await citiesAPI.deleteCity(cityId, token);
      await fetchCities();
      setSuccess("City deleted successfully.");
    } catch {
      setError("Failed to delete city");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const payload = {
      name: form.name,
      price: Number(form.price),
      areas: form.areas,
    };
    try {
      if (editingCity) {
        await citiesAPI.updateCity(editingCity, payload, token);
        setSuccess("City updated successfully.");
      } else {
        await citiesAPI.createCity(payload, token);
        setSuccess("City added successfully.");
      }
      setEditingCity(null);
      setForm({ name: "", price: "", areas: [] });
      setAreaInput("");
      setEditingAreaIdx(null);
      await fetchCities();
    } catch {
      setError("Failed to save city");
    } finally {
      setLoading(false);
    }
  };

  // ----- Area management -----
  const handleAddArea = () => {
    const name = areaInput.trim();
    if (!name || form.areas.includes(name)) return;
    setForm({ ...form, areas: [...form.areas, name] });
    setAreaInput("");
    setEditingAreaIdx(null);
  };

  const handleEditArea = (idx) => {
    setAreaInput(form.areas[idx]);
    setEditingAreaIdx(idx);
  };

  const handleSaveAreaEdit = () => {
    const name = areaInput.trim();
    if (!name) return;
    if (form.areas.includes(name) && form.areas[editingAreaIdx] !== name)
      return;
    const updated = [...form.areas];
    updated[editingAreaIdx] = name;
    setForm({ ...form, areas: updated });
    setAreaInput("");
    setEditingAreaIdx(null);
  };

  const handleDeleteArea = (idx) => {
    setForm({ ...form, areas: form.areas.filter((_, i) => i !== idx) });
    setAreaInput("");
    setEditingAreaIdx(null);
  };

  const handleMoveArea = (idx, dir) => {
    const updated = [...form.areas];
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= updated.length) return;
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    setForm({ ...form, areas: updated });
  };

  return (
    <div className="px-2 sm:px-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">City & Area Management</h2>

      {/* Alerts */}
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

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4 mb-8"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">City Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="border rounded px-3 py-2 w-full"
              placeholder="Enter city name"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">
              Shipping Price (EGP)
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className="border rounded px-3 py-2 w-full"
              placeholder="Enter price"
            />
          </div>
        </div>

        {/* Areas */}
        <div>
          <label className="block font-medium mb-1">Areas</label>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="text"
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
              placeholder="Add area name"
            />
            {editingAreaIdx !== null ? (
              <button
                type="button"
                onClick={handleSaveAreaEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddArea}
                className="bg-primary-dark text-white px-4 py-2 rounded"
              >
                Add Area
              </button>
            )}
          </div>

          {/* Area list */}
          <div className="flex flex-wrap gap-2">
            {form.areas.map((area, idx) => (
              <div
                key={area}
                className="flex items-center gap-2 border px-2 py-1 rounded bg-gray-100 text-sm"
              >
                <span>{area}</span>
                <button
                  type="button"
                  onClick={() => handleEditArea(idx)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteArea(idx)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveArea(idx, "up")}
                  disabled={idx === 0}
                  className="text-gray-600 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveArea(idx, "down")}
                  disabled={idx === form.areas.length - 1}
                  className="text-gray-600 disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-dark text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {editingCity ? "Update City" : "Add City"}
          </button>
          {editingCity && (
            <button
              type="button"
              onClick={() => {
                setEditingCity(null);
                setForm({ name: "", price: "", areas: [] });
                setAreaInput("");
                setEditingAreaIdx(null);
              }}
              className="text-gray-600 underline"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table for large screens */}
      <div className="hidden sm:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm sm:text-base border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left border">City</th>
              <th className="p-2 text-left border">Price</th>
              <th className="p-2 text-left border">Areas</th>
              <th className="p-2 text-left border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cities.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-6 text-center text-gray-500">
                  No cities found
                </td>
              </tr>
            ) : (
              cities.map((city) => (
                <tr key={city._id} className="hover:bg-gray-50 border-b">
                  <td className="p-2 border font-semibold">{city.name}</td>
                  <td className="p-2 border">{city.price} EGP</td>
                  <td className="p-2 border space-x-1">
                    {Array.isArray(city.areas)
                      ? city.areas.map((a) => (
                          <span
                            key={a}
                            className="inline-block bg-gray-100 px-2 py-1 rounded text-xs"
                          >
                            {a}
                          </span>
                        ))
                      : "-"}
                  </td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleEdit(city)}
                      className="text-blue-600 hover:underline mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(city._id)}
                      className="text-red-600 hover:underline"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4 mt-4">
        {cities.map((city) => (
          <div
            key={city._id}
            className="border rounded-lg bg-white shadow-sm p-4"
          >
            <p className="font-semibold text-lg">{city.name}</p>
            <p className="text-sm text-gray-600 mb-2">{city.price} EGP</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {Array.isArray(city.areas)
                ? city.areas.map((a) => (
                    <span
                      key={a}
                      className="bg-gray-100 border text-xs px-2 py-1 rounded"
                    >
                      {a}
                    </span>
                  ))
                : "-"}
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => handleEdit(city)}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(city._id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
