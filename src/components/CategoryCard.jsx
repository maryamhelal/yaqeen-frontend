import React from "react";
import { Link } from "react-router-dom";

export default function CategoryCard({ name, image }) {
  const fallbackImage =
    "https://via.placeholder.com/400x400/f3f4f6/6b7280?text=" +
    encodeURIComponent(name);

  return (
    <Link
      to={`/category/${name}`}
      onClick={() => console.log(`Category clicked: ${name}`)}
    >
      <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
        <div className="aspect-w-1 aspect-h-1 w-full">
          <img
            src={image || fallbackImage}
            alt={name}
            className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = fallbackImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 mb-4">
          <div
            className="
              px-4 py-2
              text-[#e0d7ce] text-md font-bold
              bg-primary-darker rounded-lg
              transform group-hover:-translate-y-2
              transition-all duration-300 ease-out"
          >
            {name.toUpperCase()}
          </div>
        </div>
      </div>
    </Link>
  );
}
