import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Navbar from "../../layout/navbar/Navbar"; 
import "./Category.css";

const GET_ALL_PRODUCTS_URL = "http://localhost:8000/api/products/getallproducts";
const ADD_TO_CART_URL = "http://localhost:8000/api/cart/newcart";
// 🔥 ADDED WISHLIST URLS
const GET_WISHLIST_URL = "http://localhost:8000/api/wishlist/getwishlist";
const TOGGLE_WISHLIST_URL = "http://localhost:8000/api/wishlist/toggle";

const CategoryPage = () => {
  const { categoryName } = useParams(); 
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔥 Start empty, we will fill this from the database!
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const fetchProductsAndWishlist = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch Products
        const response = await fetch(GET_ALL_PRODUCTS_URL);
        const data = await response.json();
        const filteredProducts = data.filter(
          (product) => product.category.toLowerCase() === categoryName.toLowerCase()
        );
        setProducts(filteredProducts);

        // 2. Fetch User's Wishlist from Database
        const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        
        if (userString && userString !== "undefined" && token) {
          const userObj = JSON.parse(userString);
          const userId = userObj._id || userObj.id;

          const wishRes = await fetch(`${GET_WISHLIST_URL}/${userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          
          if (wishRes.ok) {
            const wishData = await wishRes.json();
            // The backend sends whole products, we just need their IDs for the heart check!
            if (wishData.products) {
              const savedIds = wishData.products.map(p => p._id);
              setWishlistItems(savedIds);
            }
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setIsLoading(false);
      }
    };
    fetchProductsAndWishlist();
  }, [categoryName]); 

  const handleAddToCart = async (productId) => {
    const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    let userId = null;

    if (userString && userString !== "undefined") {
      try {
        const userObj = JSON.parse(userString);
        userId = userObj._id || userObj.id; 
      } catch (e) {
        console.error("Could not parse user data:", e);
      }
    }

    if (!userId || !token) {
      alert(`Please log in to add items to your cart.`);
      return;
    }

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

  // 🔥 Database-Powered Wishlist Toggle
  const toggleWishlist = async (productId) => {
    const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    
    let userId = null;
    if (userString && userString !== "undefined") {
      const userObj = JSON.parse(userString);
      userId = userObj._id || userObj.id;
    }

    if (!userId || !token) {
      alert("Please log in to use your wishlist!");
      return;
    }

    // 1. Optimistic UI update (makes the heart feel instantly responsive)
    if (wishlistItems.includes(productId)) {
      setWishlistItems(wishlistItems.filter(id => id !== productId));
    } else {
      setWishlistItems([...wishlistItems, productId]);
    }

    // 2. Tell the database!
    try {
      await fetch(TOGGLE_WISHLIST_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ userId, productId })
      });
    } catch (error) {
      console.error("Error toggling wishlist in database:", error);
    }
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