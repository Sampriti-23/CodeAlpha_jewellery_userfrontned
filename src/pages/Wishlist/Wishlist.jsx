import React, { useState, useEffect } from "react";
import { FaTrash, FaShoppingCart } from "react-icons/fa";
import Navbar from "../../layout/navbar/Navbar";
import "./Wishlist.css";

// 🔥 USING YOUR NEW DATABASE URLS
const GET_WISHLIST_URL = "http://localhost:8000/api/wishlist/getwishlist";
const TOGGLE_WISHLIST_URL = "http://localhost:8000/api/wishlist/toggle";
const ADD_TO_CART_URL = "http://localhost:8000/api/cart/newcart"; // Matched to your CategoryPage route!

const Wishlist = () => {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to grab secure user data
  const getUserData = () => {
    const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    let userId = null;
    if (userString && userString !== "undefined") {
      userId = JSON.parse(userString)._id || JSON.parse(userString).id;
    }
    return { userId, token };
  };

  const fetchWishlist = async () => {
    const { userId, token } = getUserData();
    
    if (!userId || !token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${GET_WISHLIST_URL}/${userId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // The backend populates the 'products' array for us!
        setWishlistProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    const { userId, token } = getUserData();
    if (!userId) return;

    // Remove instantly from UI for snappy feel
    setWishlistProducts(wishlistProducts.filter(p => p._id !== productId));

    try {
      await fetch(TOGGLE_WISHLIST_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId, productId })
      });
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const handleAddToCart = async (productId) => {
    const { userId, token } = getUserData();
    if (!userId || !token) return alert("Please log in to add to cart.");

    try {
      const res = await fetch(ADD_TO_CART_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 🔥 Added missing Token!
        },
        body: JSON.stringify({ userId, productId, qty: 1 })
      });
      
      if (res.ok) {
        alert("Added to cart from wishlist! 🛒");
      } else {
        alert("Failed to add to cart.");
      }
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
<p className="price">₹{product.price.toLocaleString()}</p>
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