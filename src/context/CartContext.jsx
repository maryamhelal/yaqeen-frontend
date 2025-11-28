import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  // Load cart from localStorage if available
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity, selectedColor, selectedSize) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product._id &&
          item.color === selectedColor &&
          item.size === selectedSize
      );
      const colorObj =
        product.colors?.find((c) => c.name === selectedColor) || {};
      const sizeObj =
        colorObj.sizes?.find((s) => s.size === selectedSize) || {};
      const maxQty = sizeObj.quantity || 1;
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, maxQty);
        return prev.map((item) =>
          item.id === product._id &&
          item.color === selectedColor &&
          item.size === selectedSize
            ? { ...item, quantity: newQty }
            : item
        );
      }
      // If adding new, clamp to maxQty
      const itemToAdd = {
        id: product._id,
        name: product.name,
        price:
          product.salePercentage > 0
            ? product.salePrice ||
              Math.round(product.price * (1 - product.salePercentage / 100))
            : product.price,
        image: colorObj.image || product.image,
        color: selectedColor,
        size: selectedSize,
        quantity: Math.min(quantity, maxQty),
        maxQty,
      };
      return [...prev, itemToAdd];
    });
  };

  const updateQuantity = (id, color, size, newQty) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.color === color && item.size === size
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const removeFromCart = (id, color, size) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.id === id && item.color === color && item.size === size)
      )
    );
  };
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
