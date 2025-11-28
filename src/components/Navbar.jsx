import React, { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faBars,
  faUser,
  faTimes,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/yaqeen logo.png";
import { useAuth } from "../context/AuthContext";
import { tagsAPI } from "../api/tags";

export default function Navbar() {
  const { cart } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  const cartItemCount = cart.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await tagsAPI.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    const fetchCollections = async () => {
      try {
        const collectionsData = await tagsAPI.getCollections();
        setCollections(collectionsData);
      } catch (error) {
        console.error("Error fetching collections:", error);
        setCollections([]);
      }
    };

    fetchCategories();
    fetchCollections();
  }, []);

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-100 z-20 fixed top-0 left-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
            >
              <img src={logo} alt="Yaqeen Logo" className="w-32" />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              {/* Categories Dropdown */}
              <div className="relative group">
                <button className="text-sm font-medium text-gray-700 hover:text-primary-dark transition-colors flex items-center">
                  <span>Categories</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="w-3 h-3 ml-1"
                  />
                </button>
                <div className="absolute left-0 bg-white shadow-lg rounded-lg hidden group-hover:block z-50">
                  <div className="flex flex-col">
                    {categories.map((cat) => (
                      <NavLink
                        key={cat._id || cat.name}
                        to={`/category/${cat.name}`}
                        className={({ isActive }) =>
                          `px-4 py-2 text-sm transition-colors duration-200 ${
                            isActive
                              ? "text-primary-dark font-semibold"
                              : "text-gray-700 hover:text-primary-dark"
                          }`
                        }
                      >
                        {cat.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>

              {/* Collections Dropdown */}
              <div className="relative group">
                <button className="text-sm font-medium text-gray-700 hover:text-primary-dark transition-colors flex items-center">
                  <span>Collections</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="w-3 h-3 ml-1"
                  />
                </button>
                <div className="absolute left-0 bg-white shadow-lg rounded-lg hidden group-hover:block z-50">
                  <div className="flex flex-col">
                    {collections.map((col) => (
                      <NavLink
                        key={col._id || col.name}
                        to={`/collection/${col.name}`}
                        className={({ isActive }) =>
                          `px-4 py-2 text-sm transition-colors duration-200 ${
                            isActive
                              ? "text-primary-dark font-semibold"
                              : "text-gray-700 hover:text-primary-dark"
                          }`
                        }
                      >
                        {col.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
              {/* Dashboard */}
              {user && (isAdmin() || isSuperAdmin()) && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-primary-dark border-b-2 border-primary-dark"
                        : "text-gray-700 hover:text-primary-dark"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
              )}
              {/* Sign In / User Icon */}
              {!user ? (
                <button
                  onClick={() => navigate("/login")}
                  className="ml-6 px-4 py-2 rounded-lg bg-primary-dark text-gray-800 font-semibold hover:bg-primary-darker transition-colors"
                >
                  Sign In
                </button>
              ) : (
                <button
                  onClick={() => navigate("/profile")}
                  className="ml-6 p-2 rounded-full bg-primary-dark text-primary hover:bg-primary-darker hover:text-primary transition-colors"
                  aria-label="User Profile"
                >
                  <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Burger Icon for Mobile */}
            <button
              className="md:hidden flex items-center p-2 text-gray-700 hover:text-primary-dark focus:outline-none ml-auto"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <FontAwesomeIcon
                icon={faBars}
                className="w-7 h-7 transition-all duration-300"
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Side Drawer for Mobile */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        {/* Drawer */}
        <div
          className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <Link to="/" onClick={() => setMenuOpen(false)}>
              <img src={logo} alt="Yaqeen Logo" className="w-28" />
            </Link>
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <FontAwesomeIcon
                icon={faTimes}
                className="w-6 h-6 text-gray-700"
              />
            </button>
          </div>
          <div className="flex flex-col px-4 py-6 space-y-4">
            {/* Categories Dropdown */}
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center justify-between w-full py-2 text-base font-medium text-gray-700 hover:text-primary-dark transition-colors"
            >
              Categories
              <span>{categoriesOpen ? "−" : "+"}</span>
            </button>
            {categoriesOpen && (
              <div className="ml-4 flex flex-col space-y-2">
                {categories.map((cat) => (
                  <NavLink
                    key={cat._id || cat.name}
                    to={`/category/${cat.name}`}
                    className={({ isActive }) =>
                      `block py-1 text-sm transition-colors duration-200 ${
                        isActive
                          ? "text-primary-dark font-semibold"
                          : "text-gray-700 hover:text-primary-dark"
                      }`
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {cat.name}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Collections Dropdown */}
            <button
              onClick={() => setCollectionsOpen(!collectionsOpen)}
              className="flex items-center justify-between w-full py-2 text-base font-medium text-gray-700 hover:text-primary-dark transition-colors"
            >
              Collections
              <span>{collectionsOpen ? "−" : "+"}</span>
            </button>
            {collectionsOpen && (
              <div className="ml-4 flex flex-col space-y-2">
                {collections.map((col) => (
                  <NavLink
                    key={col._id || col.name}
                    to={`/collection/${col.name}`}
                    className={({ isActive }) =>
                      `block py-1 text-sm transition-colors duration-200 ${
                        isActive
                          ? "text-primary-dark font-semibold"
                          : "text-gray-700 hover:text-primary-dark"
                      }`
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {col.name}
                  </NavLink>
                ))}
              </div>
            )}
            {/* Dashboard in mobile menu */}
            {user && (isAdmin() || isSuperAdmin()) && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `block py-2 text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-primary-dark font-semibold"
                      : "text-gray-700 hover:text-primary-dark"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </NavLink>
            )}
            {/* Sign In / User Icon in mobile menu */}
            {!user ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/login");
                }}
                className="mt-2 px-4 py-2 rounded-lg bg-primary-dark text-gray-800 font-semibold hover:bg-primary-darker transition-colors"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
                className="mt-2 p-2 rounded-full bg-primary-dark text-primary hover:bg-primary-darker hover:text-primary transition-colors"
                aria-label="User Profile"
              >
                <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                <span className="ml-2">View Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      <Link
        to="/cart"
        className="fixed z-40 bottom-6 right-6 bg-white shadow-lg rounded-full p-4 flex items-center justify-center hover:bg-primary-dark transition-colors border border-primary group"
        style={{ boxShadow: "0 4px 24px 0 rgba(234, 207, 238, 0.15)" }}
      >
        <FontAwesomeIcon
          icon={faCartShopping}
          className="w-6 h-6 text-primary-dark group-hover:text-white transition-colors"
        />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary-dark text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
            {cartItemCount}
          </span>
        )}
      </Link>
    </>
  );
}
