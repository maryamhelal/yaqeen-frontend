import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { messagesAPI } from "../api/messages";

const ISSUE_CATEGORIES = [
  "Order Issue",
  "Product Inquiry",
  "Payment Problem",
  "Account Issue",
  "Other",
];

const ContactMessagePage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    category: ISSUE_CATEGORIES[0],
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    try {
      const res = await messagesAPI.createMessage({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.description,
        category: form.category,
      });
      if (res && res.success) {
        setStatus("Message sent successfully!");
        setForm((f) => ({ ...f, description: "" }));
      } else {
        setStatus(res?.message || "Failed to send message.");
      }
    } catch (err) {
      setStatus(err?.message || "Failed to send message.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-24 mb-4 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Send Us a Message</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border rounded"
          required
          type="email"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          {ISSUE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe your issue"
          className="w-full p-2 border rounded"
          required
          rows={4}
        />
        <button
          type="submit"
          className="bg-primary-darker text-white px-4 py-2 rounded hover:bg-primary-dark"
        >
          Send Message
        </button>
      </form>
      {status && (
        <div className="mt-4 text-center text-green-600">{status}</div>
      )}
    </div>
  );
};

export default ContactMessagePage;
