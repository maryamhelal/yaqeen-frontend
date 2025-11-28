import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function ProductCard(props) {
  const product = props.product || props;
  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image || null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const navigate = useNavigate();

  const {
    name = "",
    price = 0,
    salePercentage = 0,
    salePrice,
    colors = [],
    image = "",
  } = product;

  // Build images array
  const images = [
    { url: image, color: null }, // main product image
    ...colors.map((color) => ({
      url: color.image,
      color: color.name,
    })),
  ];

  // Find selected color object
  const selectedColorObj = colors.find((c) => c.name === selectedColor);
  const availableSizes = selectedColorObj?.sizes || [];
  const maxQty =
    availableSizes.find((s) => s.size === selectedSize)?.quantity || 0;

  // Reset when product changes
  useEffect(() => {
    setSelectedImage(product.image);
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
  }, [product]);

  // Quantity handlers
  const handleQuantityChange = (delta) => {
    setQuantity((q) => Math.max(1, Math.min(q + delta, maxQty)));
  };

  // Thumbnail click handler
  const handleThumbnailClick = (img) => {
    setSelectedImage(img.url);
    setSelectedColor(img.color);
    setSelectedSize(null);
    setQuantity(1);
  };

  // Size selection handler
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  // Effective price
  const getEffectivePrice = () => {
    if (salePercentage > 0) {
      return salePrice || Math.round(price * (1 - salePercentage / 100));
    }
    return price;
  };
  const effectivePrice = getEffectivePrice();
  const hasSale = salePercentage > 0;

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize || quantity < 1) return;
    addToCart(product, quantity, selectedColor, selectedSize);
  };

  if (!product) {
    return <div className="p-4 text-gray-500">No product available</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
      <div className="relative overflow-hidden cursor-pointer">
        {/* Main Image */}
        <img
          src={selectedImage || image}
          alt={name}
          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
          onClick={() => navigate(`/product/${product.name}`)}
        />
        {/* Sale Badge */}
        {hasSale && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {salePercentage}% OFF
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 p-3">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img.url}
            alt={img.color || name}
            className={`w-12 h-12 object-cover rounded-lg border cursor-pointer ${
              selectedImage === img.url
                ? "border-primary-dark ring-2 ring-primary-dark"
                : "border-gray-300"
            }`}
            onClick={() => handleThumbnailClick(img)}
          />
        ))}
      </div>

      <div className="p-6">
        <h3
          className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary-dark transition-colors cursor-pointer"
          onClick={() => navigate(`/product/${product.name}`)}
        >
          {name}
        </h3>

        {/* Price Display (same style as details page now) */}
        <div className="mb-4">
          {hasSale ? (
            <div className="space-y-1">
              <div className="flex space-x-2">
                <div className="text-lg line-through text-gray-500">
                  {price?.toLocaleString()} EGP
                </div>
                <div className="text-lg font-bold text-red-600">
                  {effectivePrice?.toLocaleString()} EGP
                </div>
              </div>
              <div className="text-sm text-black-600 font-medium">
                Save {Math.round(price - effectivePrice)?.toLocaleString()} EGP
              </div>
            </div>
          ) : (
            <div className="text-xl font-bold text-primary-dark">
              {price?.toLocaleString()} EGP
            </div>
          )}
        </div>

        {/* Sizes */}
        {selectedColor && availableSizes.length > 0 && (
          <div className="flex space-x-2 mb-4">
            {availableSizes.map((sizeObj) => (
              <button
                key={sizeObj.size}
                className={`px-3 py-1 rounded-lg border-2 ${
                  selectedSize === sizeObj.size
                    ? "border-primary-dark bg-primary-light"
                    : "border-gray-300"
                }`}
                onClick={() => handleSizeSelect(sizeObj.size)}
                disabled={sizeObj.quantity < 1}
              >
                {sizeObj.size}
              </button>
            ))}
          </div>
        )}

        {/* Quantity */}
        {selectedColor && selectedSize && (
          <div className="mb-4 flex items-center space-x-3">
            <span className="font-semibold">Quantity:</span>
            <button
              className="px-3 py-1 border rounded-lg"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="w-8 text-center">{quantity}</span>
            <button
              className="px-3 py-1 border rounded-lg"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= maxQty}
            >
              +
            </button>
          </div>
        )}

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className={`w-full bg-primary-dark text-white py-2 rounded-lg font-semibold hover:bg-primary-darker transition-colors ${
            !selectedColor || !selectedSize || quantity < 1 || maxQty < 1
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={
            !selectedColor || !selectedSize || quantity < 1 || maxQty < 1
          }
        >
          {selectedColor && selectedSize && (quantity < 1 || maxQty < 1)
            ? "Sold out"
            : "Add to Cart"}
        </button>

        {/* Color Swatches */}
        {colors?.length > 0 && (
          <div className="mt-6">
            <div className="font-semibold mb-2">Colors:</div>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color.name
                      ? "border-primary-dark"
                      : "border-gray-300"
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    borderColor:
                      color.hex?.toLowerCase() === "#fff" ||
                      color.hex?.toLowerCase() === "#ffffff"
                        ? "#ccc"
                        : undefined,
                  }}
                  onClick={() => {
                    setSelectedColor(color.name);
                    setSelectedImage(color.image);
                    setSelectedSize(null);
                    setQuantity(1);
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
