import { useState, useEffect, useContext } from "react";
import { ordersAPI } from "../../api/orders";
import { AuthContext } from "../../context/AuthContext";

export default function OrderManagement() {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusUpdate, setStatusUpdate] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [token, currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await ordersAPI.getAllOrders(
        token,
        currentPage,
        10,
        statusFilter
      );
      setOrders(result.orders || []);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (orderId, status) => {
    setStatusUpdate({ ...statusUpdate, [orderId]: status });
  };

  const handleUpdate = async (orderId) => {
    if (!statusUpdate[orderId]) return;

    setLoading(true);
    try {
      await ordersAPI.updateOrderStatus(orderId, statusUpdate[orderId], token);
      setStatusUpdate((prev) => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
      await fetchOrders(); // Refresh the list
    } catch (err) {
      setError(err.message || "Failed to update order status");
      console.error("Error updating order status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>
      <div className="flex justify-between items-center">
        {/* Status Filter */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Filter by status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipping Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {loading ? "Loading orders..." : "No orders found"}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Name: {order.orderer?.name || "No name"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Email: {order.orderer?.email || "No email"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Phone: {order.orderer?.phone || "No phone"}
                      </div>
                      <div className="text-sm text-gray-500">
                        User ID: {order.orderer?.userId || "No userId"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.shippingAddress?.city || "No city"}
                      </div>
                      <div className="text-sm text-gray-900">
                        {order.shippingAddress?.area || "No area"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.shippingAddress?.street || "No street"}
                      </div>
                      {order.shippingAddress?.landmarks && (
                        <div className="text-sm text-gray-500">
                          {order.shippingAddress?.landmarks}
                        </div>
                      )}
                      {order.shippingAddress?.building && (
                        <div className="text-sm text-gray-500">
                          {order.shippingAddress?.building}
                        </div>
                      )}
                      {order.shippingAddress?.residenceType && (
                        <div className="text-sm text-gray-500">
                          {order.shippingAddress?.residenceType.replace(
                            /_/g,
                            " "
                          )}
                        </div>
                      )}
                      {order.shippingAddress?.floor && (
                        <div className="text-sm text-gray-500">
                          {order.shippingAddress?.floor}
                        </div>
                      )}
                      {order.shippingAddress?.apartment && (
                        <div className="text-sm text-gray-500">
                          {order.shippingAddress?.apartment}
                        </div>
                      )}
                      {order.shippingAddress?.companyName && (
                        <div className="text-sm text-gray-500">
                          {order.shippingAddress?.companyName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {order.paymentMethod === "Cash" ? (
                        <span className="text-sm text-gray-900">
                          Cash on Delivery
                        </span>
                      ) : (
                        <>
                          <span className="text-sm text-gray-900">
                            Instapay
                          </span>
                          <div className="text-sm text-gray-900">
                            Username: {order.instapayUsername}
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={statusUpdate[order._id] || order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className={`text-sm px-2 py-1 rounded-full font-medium ${getStatusColor(
                          statusUpdate[order._id] || order.status
                        )} border-0 focus:ring-2 focus:ring-primary`}
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.totalPrice?.toLocaleString()} EGP
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-primary-dark hover:text-primary-darker">
                          View Details
                        </summary>
                        <div className="mt-2 space-y-2">
                          {order.items?.map((item, i) => (
                            <div key={i} className="bg-gray-50 p-2 rounded">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-600">
                                {item.size}, {item.color} x {item.quantity}
                              </div>
                              <div className="text-sm font-medium">
                                {item.price?.toLocaleString()} EGP
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {statusUpdate[order._id] &&
                        statusUpdate[order._id] !== order.status && (
                          <button
                            onClick={() => handleUpdate(order._id)}
                            disabled={loading}
                            className="bg-primary-dark text-white px-3 py-1 rounded text-sm hover:bg-primary-darker transition-colors disabled:opacity-50"
                          >
                            {loading ? "Updating..." : "Update"}
                          </button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page{" "}
                  <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page =
                      Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                      i;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? "z-10 bg-primary-dark border-primary-dark text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
