import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const containerClass =
    cart.length === 0 ? "min-h-[40vh] bg-gray-50" : "min-h-screen bg-gray-50";

  return (
    <div className={containerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Your Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 text-xl mb-6">Your cart is empty</div>
            <Link
              to="/"
              className="inline-block bg-primary-dark text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-darker transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Cart Items ({cart.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.color}-${item.size}`}
                      className="p-6 flex items-center space-x-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-md font-medium text-gray-800">
                          {item.name}
                        </h3>
                        <p className="text-primary-dark font-bold">
                          {item.price?.toLocaleString()} EGP
                        </p>
                        <div className="text-sm text-gray-500">
                          Size: {item.size} | Color: {item.color}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.color,
                              item.size,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="px-3 py-1 text-gray-600 hover:text-primary-dark transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-3 py-1">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.color,
                              item.size,
                              Math.min(item.quantity + 1, item.maxQty || 1)
                            )
                          }
                          className="px-3 py-1 text-gray-600 hover:text-primary-dark transition-colors"
                          disabled={item.quantity >= (item.maxQty || 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          {(item.price * item.quantity).toLocaleString()} EGP
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          removeFromCart(item.id, item.color, item.size)
                        }
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-800">
                        Total
                      </span>
                      <span className="text-lg font-bold text-primary-dark">
                        {subtotal.toLocaleString()} EGP
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-primary-dark text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-darker transition-colors mt-6"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
