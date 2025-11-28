import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminManagement() {
  const { token } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/admins`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAdmins);
  }, [token]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await fetch(`${API_BASE_URL}/admins/${editing}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
    } else {
      await fetch(`${API_BASE_URL}/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
    }
    setForm({ name: "", email: "", password: "" });
    setEditing(null);
    fetch(`${API_BASE_URL}/admins`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAdmins);
  };

  const handleEdit = (admin) => {
    setEditing(admin._id);
    setForm({ name: admin.name, email: admin.email, password: "" });
  };
  const handleDelete = async (id) => {
    await fetch(`${API_BASE_URL}/admins/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetch(`${API_BASE_URL}/admins`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAdmins);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Management</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl shadow mb-8 space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="border p-2 rounded"
            required
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 rounded"
            required
          />
        </div>
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          type="password"
          className="border p-2 rounded w-full"
          required={!editing}
        />
        <button
          type="submit"
          className="bg-primary-dark text-white px-6 py-2 rounded font-bold"
        >
          {editing ? "Update" : "Add"} Admin
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {admins.map((admin) => (
          <div
            key={admin._id}
            className="bg-white p-4 rounded-xl shadow flex flex-col"
          >
            <div className="font-bold text-lg mb-1">{admin.name}</div>
            <div className="text-gray-600 mb-1">{admin.email}</div>
            <div className="text-gray-600 mb-1">
              {admin.address && typeof admin.address === "object" ? (
                <>
                  {admin.address.city && (
                    <span>
                      {admin.address.city
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      ,{" "}
                    </span>
                  )}
                  {admin.address.area && <span>{admin.address.area}, </span>}
                  {admin.address.street && (
                    <span>{admin.address.street}, </span>
                  )}
                  {admin.address.landmarks && (
                    <span>{admin.address.landmarks}, </span>
                  )}
                  {admin.address.residenceType && (
                    <span>
                      {admin.address.residenceType.replace(/_/g, " ")}
                    </span>
                  )}
                  {admin.address.residenceType === "apartment" && (
                    <>
                      {admin.address.floor && (
                        <span>, Floor: {admin.address.floor}</span>
                      )}
                      {admin.address.apartment && (
                        <span>, Apt: {admin.address.apartment}</span>
                      )}
                    </>
                  )}
                </>
              ) : (
                admin.address
              )}
            </div>
            <div className="flex-1"></div>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => handleEdit(admin)}
                className="bg-yellow-400 px-3 py-1 rounded"
              >
                Edit
              </button>
              {admin.role !== "superadmin" && (
                <button
                  onClick={() => handleDelete(admin._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
