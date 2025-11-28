import { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { productsAPI } from "../../api/products";
import { CartContext } from "../../context/CartContext";

export default function ProductDetailsPage() {
  const { productName } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // URL of selected image
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    productsAPI.getProductByName(productName).then((data) => {
      setProduct(data);
      setSelectedImage(data.image); // default to product image
      setSelectedColor(null);
      setSelectedSize(null);
      setQuantity(1);
    });
  }, [productName]);

  if (!product) return <div className="p-8 text-center">Loading...</div>;

  // Build images array: product image first, then color images
  const images = [
    { url: product.image, color: null }, // main product image
    ...product.colors.map((color) => ({
      url: color.image,
      color: color.name,
    })),
  ];

  // Find selected color object
  const selectedColorObj = product.colors?.find(
    (color) => color.name === selectedColor
  );

  // Sizes for selected color
  const availableSizes = selectedColorObj?.sizes || [];

  // Max quantity for selected color/size
  const maxQty =
    availableSizes.find((s) => s.size === selectedSize)?.quantity || 0;

  // Sale logic
  const getEffectivePrice = () => {
    if (product.salePercentage > 0) {
      return Math.round(product.price * (1 - product.salePercentage / 100));
    }
    return product.price;
  };
  const effectivePrice = getEffectivePrice();
  const hasSale = product.salePercentage > 0;

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

  // Quantity handlers
  const handleQuantityChange = (delta) => {
    setQuantity((q) => Math.max(1, Math.min(q + delta, maxQty)));
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize || quantity < 1) return;
    addToCart(product, quantity, selectedColor, selectedSize);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        {/* Main Image */}
        <div className="mb-4">
          <img
            src={selectedImage}
            alt={product.name}
            className="w-full h-96 object-cover rounded-xl border"
          />
          {/* Sale Badge */}
          {hasSale && (
            <div className="absolute top-28 right-10 bg-red-500 text-white px-2 py-2 rounded-full text-sm font-bold">
              {product.salePercentage}% OFF
            </div>
          )}
        </div>
        {/* Thumbnails */}
        <div className="flex gap-2">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt={img.color || product.name}
              className={`w-16 h-16 object-cover rounded-lg border cursor-pointer ${
                selectedImage === img.url
                  ? "border-primary-dark ring-2 ring-primary-dark"
                  : "border-gray-300"
              }`}
              onClick={() => handleThumbnailClick(img)}
              style={{ boxSizing: "border-box" }}
            />
          ))}
        </div>
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
        <p className="mb-4 text-gray-700">{product.description}</p>
        <div className="mb-4">
          {hasSale ? (
            <div>
              <div className="text-lg line-through text-gray-500">
                {product.price?.toLocaleString()} EGP
              </div>
              <div className="text-2xl font-bold text-red-600">
                {effectivePrice?.toLocaleString()} EGP
              </div>
              <div className="text-sm text-black-600 font-medium">
                Save{" "}
                {Math.round(product.price - effectivePrice)?.toLocaleString()}{" "}
                EGP
              </div>
            </div>
          ) : (
            <div className="text-xl font-bold text-primary-dark">
              {product.price?.toLocaleString()} EGP
            </div>
          )}
        </div>
        {/* Color & Sizes */}
        {selectedColor && (
          <div className="mb-4">
            <div className="font-semibold mb-2">
              Selected Color: {selectedColor}
            </div>
            <div className="flex gap-2">
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
          </div>
        )}
        {/* Size Chart
        {product.colors?.sizes?.length > 0 && (
          <div className="mb-4">
            <div className="font-semibold mb-2">Size Chart:</div>
            <table className="w-full text-left border border-gray-300 rounded-lg">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Size</th>
                </tr>
              </thead>
              <tbody>
                {product.colors.sizes.map((sizeObj) => (
                  <tr key={sizeObj.size}>
                    <td className="py-2 px-4 border-b">{sizeObj.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )} */}
        {/* Quantity */}
        {selectedColor && selectedSize && (
          <div className="mb-4 flex items-center gap-3">
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
        {/* Add to Cart Button */}
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
        <div className="mt-6">
          <div className="font-semibold mb-2">Colors:</div>
          <div className="flex gap-2">
            {product.colors.map((color) => (
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
      </div>
    </div>
  );
}
