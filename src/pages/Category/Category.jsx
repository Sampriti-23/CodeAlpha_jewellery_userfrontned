import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Navbar from "../../layout/navbar/Navbar"; // Assuming you want Navbar here
import "./Category.css";

const GET_ALL_PRODUCTS_URL = "http://localhost:8000/api/products/getallproducts";
const ADD_TO_CART_URL = "http://localhost:8000/api/cart/newcart";

const CategoryPage = () => {
  const { categoryName } = useParams(); 
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔥 FIX 2: Initialize Wishlist directly from LocalStorage so hearts stay red if refreshed!
  const [wishlistItems, setWishlistItems] = useState(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(GET_ALL_PRODUCTS_URL);
        const data = await response.json();
        
        const filteredProducts = data.filter(
          (product) => product.category.toLowerCase() === categoryName.toLowerCase()
        );
        
        setProducts(filteredProducts);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch products", error);
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [categoryName]); 

  // 🔥 FIX 1: Look inside sessionStorage to get the correct User ID
const handleAddToCart = async (productId) => {
    // 1. Check BOTH storages (just in case your Login component uses localStorage)
    const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    
    let userId = null;

    // 2. Safely parse the user object
    if (userString && userString !== "undefined") {
      try {
        const userObj = JSON.parse(userString);
        // Look for _id (MongoDB default) OR id
        userId = userObj._id || userObj.id; 
      } catch (e) {
        console.error("Could not parse user data:", e);
      }
    }

    // 🛑 DEBUGGING: This will tell us EXACTLY what is missing!
    console.log("--- ADD TO CART DEBUG ---");
    console.log("Token exists?", !!token);
    console.log("Raw User String:", userString);
    console.log("Extracted User ID:", userId);
    console.log("-------------------------");

    // 3. The check that is currently failing
    if (!userId || !token) {
      alert(`Login Error! Token: ${!!token}, UserID: ${userId}. Open DevTools (F12) Console for details.`);
      return;
    }

    // 4. The actual API Call
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
        alert("Item successfully added to cart! 🛒");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || `Server Error: ${res.status}`);
      }
    } catch (err) {
      console.error("Full Cart Error:", err);
      alert(`Could not add to cart: ${err.message}`); 
    }
  };
  // 🔥 FIX 2: Actually save the Wishlist to LocalStorage so the Wishlist Page can read it
  const toggleWishlist = (productId) => {
    let updatedWishlist;
    
    if (wishlistItems.includes(productId)) {
      // If it's already in the wishlist, remove it
      updatedWishlist = wishlistItems.filter(id => id !== productId);
    } else {
      // If it's not in the wishlist, add it
      updatedWishlist = [...wishlistItems, productId];
    }

    // 1. Update the UI state (Heart turns red/empty)
    setWishlistItems(updatedWishlist);
    
    // 2. Save it to the browser so the Wishlist Page can load it!
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  if (isLoading) {
    return <div className="category-page-loading"><h2>Loading {categoryName}s...</h2></div>;
  }

  return (
    <>
    <div className="category-page">
      <Navbar />
      <div className="category-container">
        <div className="category-header">
          <h2>{categoryName}s <span>({products.length} Designs)</span></h2>
        </div>
        
        <div className="product-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <div className="product-card" key={product._id}>
                
                <div className="product-image-wrapper">
                  <img 
                    src={product.image || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=500&auto=format&fit=crop"} 
                    alt={product.name} 
                    className="product-image"
                  />
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">
                    {product.description ? product.description.slice(0, 50) + "..." : "Elegant piece for everyday wear."}
                  </p>
                  <p className="product-price">₹{product.price.toLocaleString()}</p>
                  
                  <div className="button-group">
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product._id)}
                    >
                      Add to Cart
                    </button>
                    
                    <button 
                      className="wishlist-btn"
                      onClick={() => toggleWishlist(product._id)}
                      title="Add to Wishlist"
                    >
                      {wishlistItems.includes(product._id) ? (
                        <FaHeart className="heart-icon filled" style={{color: "#7e2a40"}} />
                      ) : (
                        <FaRegHeart className="heart-icon outline" />
                      )}
                    </button>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="no-products">
              <p>No {categoryName}s currently available. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default CategoryPage;