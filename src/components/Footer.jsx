import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { tagsAPI } from "../api/tags";

export default function Footer() {
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await tagsAPI.getCategories();
        const collectionsData = await tagsAPI.getCollections();

        setCategories(categoriesData.slice(0, 1));
        setCollections(collectionsData.slice(0, 1));
      } catch (error) {
        console.error("Error fetching data:", error);
        setCategories([]);
        setCollections([]);
      }
    };

    fetchData();
  }, []);

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Yaqeen</h3>
            <p className="text-gray-300">
              Modest fashion, redefined ✨ <br />
              Elegant & Trendy Hijab Wear 🧕
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              {/* First category */}
              {categories.map((cat) => (
                <li key={cat._id || cat.name}>
                  <Link
                    to={`/category/${cat.name}`}
                    className="text-gray-300 hover:text-white"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              {/* First collection */}
              {collections.map((col) => (
                <li key={col._id || col.name}>
                  <Link
                    to={`/collection/${col.name}`}
                    className="text-gray-300 hover:text-white"
                  >
                    {col.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-white">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold">Contact</h4>
            <p className="text-gray-300">
              Email:{" "}
              <a href="mailto:yaqeenshopp@gmail.com">yaqeenshopp@gmail.com</a>
            </p>
            <p className="text-gray-300">Phone: +20 10 14314533</p>
            <p className="text-gray-300">
              Instagram:{" "}
              <a
                href="https://www.instagram.com/yaqeen_shopp/"
                className="text-gray-300 hover:text-white"
              >
                yaqeen_shopp
              </a>
            </p>
            <p className="text-gray-300">
              Facebook:{" "}
              <a
                href="https://web.facebook.com/profile.php?id=61573580836180"
                className="text-gray-300 hover:text-white"
              >
                Yaqeen Shop
              </a>
            </p>
            <p className="text-gray-300">
              Tiktok:{" "}
              <a
                href="https://www.tiktok.com/@yaqeenshopp"
                className="text-gray-300 hover:text-white"
              >
                yaqeenshopp
              </a>
            </p>
            <div className="my-2">
              <a
                href="/contact-message"
                className="inline-block text-white bg-primary-darker px-2 py-2 rounded hover:bg-primary-dark transition"
              >
                Send us a message
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>2025 Yaqeen. &copy; All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
