import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import "./Category.css";
import Navbar from "../../layout/navbar/Navbar";

const GET_ALL_PRODUCTS_URL = "http://localhost:8000/api/products/getallproducts";
const ADD_TO_CART_URL = "http://localhost:8000/api/cart/add";

const CategoryPage = () => {
  const { categoryName } = useParams(); // Gets 'Ring', 'Necklace', etc. from the URL
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Local state to handle UI toggling for wishlist hearts
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(GET_ALL_PRODUCTS_URL);
        const data = await response.json();
        
        // Filter dynamically based on the URL parameter
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
  }, [categoryName]); // Re-run if the user clicks a different category in the navbar

  // Handle Add to Cart
  const handleAddToCart = async (productId) => {
    const userId = localStorage.getItem("userId"); // Ensure this matches how you save the user ID
    if (!userId) {
      alert("Please log in to add items to your cart!");
      return;
    }

    try {
      const res = await fetch(ADD_TO_CART_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, qty: 1 })
      });
      
      if (res.ok) {
        alert("Item successfully added to cart!");
      } else {
        throw new Error("Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding item to cart.");
    }
  };

  // Handle Wishlist Toggle (UI only for now, you can hook this to a backend route later)
  const toggleWishlist = (productId) => {
    setWishlistItems((prev) => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) // Remove if already in wishlist
        : [...prev, productId] // Add to wishlist
    );
  };

  if (isLoading) {
    return <div className="category-page-loading"><h2>Loading {categoryName}s...</h2></div>;
  }

  return (
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
              
              {/* IMAGE WRAPPER */}
              <div className="product-image-wrapper">
                {/* Fallback image just in case your DB doesn't have an image string yet */}
                <img 
                  src={product.image || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=500&auto=format&fit=crop"} 
                  alt={product.name} 
                  className="product-image"
                />
              </div>

              {/* PRODUCT INFO */}
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">
                  {product.description ? product.description.slice(0, 50) + "..." : "Elegant piece for everyday wear."}
                </p>
                <p className="product-price">₹{product.price.toLocaleString()}</p>
                
                {/* BUTTON GROUP (Side by Side) */}
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
                      <FaHeart className="heart-icon filled" />
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
  );
};

export default CategoryPage;