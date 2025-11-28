import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function UserManagement() {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setUsers);
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(users.filter((u) => u._id !== id));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow text-sm md:text-base text-center">
          <thead>
            <tr>
              <th className="p-2">User ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Address</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="p-2">{user.userId}</td>
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.phone}</td>
                  <td className="p-2">
                    {user.address && typeof user.address === "object" ? (
                      <>
                        {user.address.city && (
                          <p>
                            City:{" "}
                            {user.address.city
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                        )}
                        {user.address.area && <p>Area: {user.address.area}</p>}
                        {user.address.street && (
                          <p>Street: {user.address.street}</p>
                        )}
                        {user.address.landmarks && (
                          <p>Landmarks/Notes: {user.address.landmarks}</p>
                        )}
                        {user.address.building && (
                          <p>Building Number: {user.address.building}</p>
                        )}
                        {user.address.residenceType && (
                          <p>
                            Residence Type:{" "}
                            {user.address.residenceType.replace(/_/g, " ")}
                          </p>
                        )}
                        {user.address.residenceType === "apartment" && (
                          <>
                            {user.address.floor && (
                              <p>Floor: {user.address.floor}</p>
                            )}
                            {user.address.apartment && (
                              <p>Apartment: {user.address.apartment}</p>
                            )}
                          </>
                        )}
                        {user.address.residenceType === "work" && (
                          <>
                            {user.address.companyName && (
                              <p>Company: {user.address.companyName}</p>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      user.address
                    )}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
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
    </div>
  );
}
