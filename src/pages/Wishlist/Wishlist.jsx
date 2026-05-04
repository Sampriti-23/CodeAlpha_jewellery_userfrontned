import React, { useState, useEffect } from "react";
import { FaTrash, FaShoppingCart } from "react-icons/fa";
import Navbar from "../../layout/navbar/Navbar";
import "./Wishlist.css";

const GET_ALL_PRODUCTS_URL = "http://localhost:8000/api/products/getallproducts";
const ADD_TO_CART_URL = "http://localhost:8000/api/cart/add";

const Wishlist = () => {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get Wishlist IDs from LocalStorage
  const getWishlistIds = () => JSON.parse(localStorage.getItem("wishlist")) || [];

  useEffect(() => {
    const fetchWishlist = async () => {
      const savedIds = getWishlistIds();
      if (savedIds.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch all products, then filter only the ones that are in the wishlist array
        const response = await fetch(GET_ALL_PRODUCTS_URL);
        const allProducts = await response.json();
        
        const filtered = allProducts.filter(product => savedIds.includes(product._id));
        setWishlistProducts(filtered);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = (productId) => {
    const currentIds = getWishlistIds();
    const updatedIds = currentIds.filter(id => id !== productId);
    localStorage.setItem("wishlist", JSON.stringify(updatedIds));
    
    // Update UI
    setWishlistProducts(wishlistProducts.filter(p => p._id !== productId));
  };

  const handleAddToCart = async (productId) => {
    const userId = sessionStorage.getItem("userId") || JSON.parse(sessionStorage.getItem("user"))?._id;
    if (!userId) return alert("Please log in to add to cart.");

    try {
      const res = await fetch(ADD_TO_CART_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, qty: 1 })
      });
      if (res.ok) alert("Added to cart from wishlist!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="wishlist-page">
        <h2>My Wishlist</h2>
        <p>Products you have saved for later.</p>

        {isLoading ? (
          <p>Loading your wishlist...</p>
        ) : wishlistProducts.length === 0 ? (
          <div className="empty-wishlist">
            <h3>Your wishlist is empty!</h3>
            <p>Click the heart icon on any product to save it here.</p>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistProducts.map(product => (
              <div className="wishlist-card" key={product._id}>
                <img src={product.image || "https://via.placeholder.com/200"} alt={product.name} />
                <div className="wishlist-info">
                  <h4>{product.name}</h4>
                  <p className="price">₹{product.price}</p>
                </div>
                <div className="wishlist-actions">
                  <button className="add-cart-btn" onClick={() => handleAddToCart(product._id)}>
                    <FaShoppingCart /> Add
                  </button>
                  <button className="remove-btn" onClick={() => handleRemoveFromWishlist(product._id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;