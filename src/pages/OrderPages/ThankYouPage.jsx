import { useLocation, Link } from "react-router-dom";

export default function ThankYouPage() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
          <p className="mb-6">You have not placed an order yet.</p>
          <Link
            to="/"
            className="inline-block bg-primary-dark text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg text-center">
        <h2 className="text-2xl font-bold mb-6">Thank you for your order!</h2>
        <p className="mb-4">
          Order Number: <span className="font-mono">{order.orderNumber}</span>
        </p>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <ul className="mb-2 text-left">
            {order.items.map((item, idx) => (
              <li key={item._id || idx} className="mb-1">
                <span className="font-medium">{item.name}</span> ({item.size},{" "}
                {item.color}) x {item.quantity} -{" "}
                <span className="font-mono">{item.price} EGP</span>
              </li>
            ))}
          </ul>
          <div className="text-right font-bold">
            Total: {order.totalPrice} EGP
          </div>
        </div>
        <div className="mb-4 text-left">
          <h3 className="font-semibold mb-2">Shipping Address</h3>
          <div>{order.shippingAddress?.name}</div>
          <div>{order.shippingAddress?.address}</div>
          <div>{order.shippingAddress?.phone}</div>
        </div>
        <p className="mb-6">
          A confirmation email has been sent to{" "}
          <span className="font-mono">{order.orderer?.email}</span>.
        </p>
        <Link
          to="/"
          className="inline-block bg-primary-dark text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
}
