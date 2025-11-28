import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { messagesAPI } from "../../api/messages";

const MessageManagement = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await messagesAPI.getAllMessages(token);
        setMessages(res.data || res.data?.data || []);
      } catch (err) {
        setMessages([]);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [token]);

  const handleResolveMessage = async (messageId) => {
    try {
      await messagesAPI.resolveMessage(messageId, token);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, resolved: true } : msg
        )
      );
    } catch (err) {
      console.error("Failed to resolve message:", err);
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <div className="p-8 text-center">Access denied.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Message Management</h2>
      <div className="max-w-6xl mx-auto mt-10 p-4 sm:p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center sm:text-left">
          Messages
        </h2>

        {loading ? (
          <div className="text-center py-6">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No messages found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="hidden sm:table w-full border text-sm sm:text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Phone</th>
                  <th className="border p-2">Category</th>
                  <th className="border p-2">Message</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg._id} className="hover:bg-gray-50">
                    <td className="border p-2">{msg.name}</td>
                    <td className="border p-2 break-all">{msg.email}</td>
                    <td className="border p-2">{msg.phone}</td>
                    <td className="border p-2">{msg.category || "-"}</td>
                    <td className="border p-2 max-w-xs truncate">
                      {msg.message}
                    </td>
                    <td className="border p-2 whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleString()}
                    </td>
                    <td className="border p-2 text-center">
                      {msg.resolved ? (
                        <span className="text-green-600 font-semibold">
                          Resolved
                        </span>
                      ) : (
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => handleResolveMessage(msg._id)}
                        >
                          Mark as Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className="border rounded-lg p-4 bg-gray-50 shadow-sm"
                >
                  <p className="font-semibold text-lg">{msg.name}</p>
                  <p className="text-gray-600 text-sm mb-2 break-all">
                    {msg.email}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Phone:</strong> {msg.phone || "-"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Category:</strong> {msg.category || "-"}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Message:</strong> {msg.message}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                  {msg.resolved ? (
                    <span className="text-green-600 font-semibold">
                      Resolved
                    </span>
                  ) : (
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => handleResolveMessage(msg._id)}
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageManagement;
