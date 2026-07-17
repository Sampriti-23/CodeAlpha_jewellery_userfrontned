import React, { useState, useEffect } from "react";
import { FaTrash, FaShoppingCart } from "react-icons/fa";
import Navbar from "../../layout/navbar/Navbar";
import "./Wishlist.css";

const baseurl="https://codealpha-jewellery-backend.onrender.com"
const GET_WISHLIST_URL = `${baseurl}/api/wishlist/getwishlist`;
const TOGGLE_WISHLIST_URL = `${baseurl}/api/wishlist/toggle`;
const ADD_TO_CART_URL = `${baseurl}/api/cart/newcart`; 

const Wishlist = () => {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
          "Authorization": `Bearer ${token}` 
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

  const getDisplayImage = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/80";
    return imagePath.startsWith('http') 
      ? imagePath 
      : `${baseurl}${imagePath}`;
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
                
                <div style={{ position: "relative" }}>
                  {/* 🔥 Sale Badge for Wishlist Images */}
                  {product.salePrice && product.salePrice > 0 && (
                    <span style={{ position: "absolute", top: "10px", left: "10px", background: "#d9534f", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                      SALE
                    </span>
                  )}
                  <img src={getDisplayImage(product.image)} alt={product.name} />
                </div>
                
                <div className="wishlist-info">
                  <h4>{product.name}</h4>
                  
                  {/* 🔥 Sale Price Logic for Wishlist */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {product.salePrice && product.salePrice > 0 ? (
                      <>
                        <p className="price" style={{ color: "#d9534f", margin: 0, fontWeight: "bold" }}>₹{product.salePrice.toLocaleString()}</p>
                        <p className="price" style={{ textDecoration: "line-through", color: "#888", fontSize: "14px", margin: 0 }}>₹{product.price.toLocaleString()}</p>
                      </>
                    ) : (
                      <p className="price" style={{ margin: 0 }}>₹{product.price.toLocaleString()}</p>
                    )}
                  </div>

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