import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProductManagement from "../components/management/ProductManagement";
import OrderManagement from "../components/management/OrderManagement";
import AdminManagement from "../components/management/AdminManagement";
import UserManagement from "../components/management/UserManagement";
import PromocodeManagement from "../components/management/PromocodeManagement";
import TagsManagement from "../components/management/TagsManagement";
import MessageManagement from "../components/management/MessageManagement";
import CityManagement from "../components/management/CityManagement";

export default function DashboardPage() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [tab, setTab] = useState("products");

  if (!user || (!isAdmin() && !isSuperAdmin())) {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        Access Denied
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-20 md:px-8 py-20">
      <div className="sticky top-0 z-10 bg-gray-50 pb-2 pt-2 md:pt-0 md:pb-0">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-center md:text-left">
          Admin Dashboard
        </h1>
        <div className="flex overflow-x-auto gap-2 md:space-x-4 mb-4 md:mb-8 px-1 pt-8 scrollbar-thin scrollbar-thumb-primary-dark scrollbar-track-gray-200">
          <button
            onClick={() => setTab("products")}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
              tab === "products"
                ? "bg-primary-dark text-white"
                : "bg-white text-gray-800 border border-gray-200"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
              tab === "orders"
                ? "bg-primary-dark text-white"
                : "bg-white text-gray-800 border border-gray-200"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setTab("tags")}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
              tab === "tags"
                ? "bg-primary-dark text-white"
                : "bg-white text-gray-800 border border-gray-200"
            }`}
          >
            Tags
          </button>
          <button
            onClick={() => setTab("cities")}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
              tab === "cities"
                ? "bg-primary-dark text-white"
                : "bg-white text-gray-800 border border-gray-200"
            }`}
          >
            Cities
          </button>
          <button
            onClick={() => setTab("messages")}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
              tab === "messages"
                ? "bg-primary-dark text-white"
                : "bg-white text-gray-800 border border-gray-200"
            }`}
          >
            Messages
          </button>
          {isSuperAdmin() && (
            <>
              <button
                onClick={() => setTab("users")}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                  tab === "users"
                    ? "bg-primary-dark text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setTab("admins")}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                  tab === "admins"
                    ? "bg-primary-dark text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                Admins
              </button>
              <button
                onClick={() => setTab("promocodes")}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                  tab === "promocodes"
                    ? "bg-primary-dark text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                Promocodes
              </button>
            </>
          )}
        </div>
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="border-t border-gray-200 mb-4 md:mb-8"></div>
        {tab === "products" && <ProductManagement />}
        {tab === "orders" && <OrderManagement />}
        {tab === "tags" && <TagsManagement />}
        {tab === "cities" && <CityManagement />}
        {tab === "messages" && <MessageManagement />}
        {tab === "admins" && isSuperAdmin() && <AdminManagement />}
        {tab === "users" && isSuperAdmin() && <UserManagement />}
        {tab === "promocodes" && isSuperAdmin() && <PromocodeManagement />}
      </div>
    </div>
  );
}
