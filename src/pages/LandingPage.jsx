import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import { tagsAPI } from "../api/tags";

export default function LandingPage() {
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [empty, setEmpty] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesData, collectionsData] = await Promise.all([
          tagsAPI.getCategories(),
          tagsAPI.getCollections(),
        ]);
        setCategories(categoriesData);
        setCollections(collectionsData);
        setEmpty(categoriesData.length === 0 && collectionsData.length === 0);
      } catch (err) {
        console.error("Error fetching data:", err);
        setEmpty(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCollectionClick = (collectionName) => {
    navigate(`/collection/${collectionName}`);
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Discover Your Style
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our collection of elegant and modest fashion pieces designed
            for the modern woman
          </p>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full text-center text-gray-500">
              <p>Loading categories...</p>
            </div>
          ) : categories.length === 0 || empty ? (
            <div className="col-span-full text-center text-gray-500">
              <p className="text-lg">No categories available at the moment.</p>
            </div>
          ) : (
            categories.map((cat) => (
              <CategoryCard
                key={cat._id || cat.name}
                name={cat.name}
                image={cat.image}
              />
            ))
          )}
        </div>
      </div>

      {/* Collections Section */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Featured Collections
          </h2>
          {loading ? (
            <div className="text-center text-gray-500">
              <p>Loading collections...</p>
            </div>
          ) : collections.length === 0 || empty ? (
            <div className="text-center text-gray-500">
              <p className="text-lg">No collections available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((collection) => (
                <div
                  key={collection._id || collection.name}
                  className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleCollectionClick(collection.name)}
                >
                  {collection.image && (
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-80 object-cover rounded-t-lg"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-gray-600 mb-4">
                        {collection.description}
                      </p>
                    )}
                    <button className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                      Explore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
