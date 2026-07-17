import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Navbar from "../../layout/navbar/Navbar"; 
import "./Category.css";

const baseurl ="https://codealpha-jewellery-backend.onrender.com";
const GET_ALL_PRODUCTS_URL = `${baseurl}/api/products/getallproducts`;
const ADD_TO_CART_URL = `${baseurl}/api/cart/newcart`;
const GET_WISHLIST_URL = `${baseurl}/api/wishlist/getwishlist`;
const TOGGLE_WISHLIST_URL = `${baseurl}/api/wishlist/toggle`;

const CategoryPage = () => {
  const { categoryName } = useParams(); 
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

    if (wishlistItems.includes(productId)) {
      setWishlistItems(wishlistItems.filter(id => id !== productId));
    } else {
      setWishlistItems([...wishlistItems, productId]);
    }

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

  const getDisplayImage = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/80";
    return imagePath.startsWith('http') 
      ? imagePath 
      : `${baseurl}${imagePath}`;
  };

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
                
                <div className="product-image-wrapper" style={{ position: "relative" }}>
                  {/* 🔥 Sale Badge */}
                  {product.salePrice && product.salePrice > 0 && (
                    <span style={{ position: "absolute", top: "10px", left: "10px", background: "#d9534f", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", zIndex: 2 }}>
                      SALE
                    </span>
                  )}
                  <img 
                    src={getDisplayImage(product.image)} 
                    alt={product.name} 
                    className="product-image"
                  />
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">
                    {product.description ? product.description.slice(0, 50) + "..." : "Elegant piece for everyday wear."}
                  </p>
                  
                  {/* 🔥 Sale Price Logic */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '10px 0' }}>
                    {product.salePrice && product.salePrice > 0 ? (
                      <>
                        <p className="product-price" style={{ color: "#d9534f", margin: 0, fontWeight: "bold" }}>₹{product.salePrice.toLocaleString()}</p>
                        <p className="product-price" style={{ textDecoration: "line-through", color: "#888", fontSize: "14px", margin: 0 }}>₹{product.price.toLocaleString()}</p>
                      </>
                    ) : (
                      <p className="product-price" style={{ margin: 0 }}>₹{product.price.toLocaleString()}</p>
                    )}
                  </div>
                  
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