import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Navbar from "../../layout/navbar/Navbar"; 
import "./Sale.css";

const baseurl ="https://codealpha-jewellery-backend.onrender.com";
const GET_ALL_PRODUCTS_URL = `${baseurl}/api/products/getallproducts`;
const ADD_TO_CART_URL = `${baseurl}/api/cart/newcart`;
const GET_WISHLIST_URL = `${baseurl}/api/wishlist/getwishlist`;
const TOGGLE_WISHLIST_URL = `${baseurl}/api/wishlist/toggle`;

const OnSaleProducts = () => {
  const [saleProducts, setSaleProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch All Products
        const response = await fetch(GET_ALL_PRODUCTS_URL);
        const data = await response.json();
        
        // 🔥 FILTER: Only keep products that have a valid salePrice
        const discountedItems = data.filter(
          (product) => product.salePrice && product.salePrice > 0
        );
        setSaleProducts(discountedItems);

        // 2. Fetch User's Wishlist
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
        console.error("Failed to fetch sale products", error);
        setIsLoading(false);
      }
    };
    fetchSaleProducts();
  }, []); 

  const handleAddToCart = async (productId) => {
    const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    let userId = null;

    if (userString && userString !== "undefined") {
      userId = JSON.parse(userString)._id || JSON.parse(userString).id; 
    }

    if (!userId || !token) {
      return alert(`Please log in to add items to your cart.`);
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
      
      if (res.ok) alert("Sale item added to cart! 🛒");
      else alert("Failed to add to cart.");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWishlist = async (productId) => {
    const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    
    let userId = null;
    if (userString && userString !== "undefined") {
      userId = JSON.parse(userString)._id || JSON.parse(userString).id;
    }

    if (!userId || !token) {
      return alert("Please log in to use your wishlist!");
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
      console.error(error);
    }
  };

  const getDisplayImage = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/80";
    return imagePath.startsWith('http') ? imagePath : `${baseurl}${imagePath}`;
  };

  // 🔥 Helper to calculate discount percentage
  const calculateDiscount = (regularPrice, salePrice) => {
    const discount = ((regularPrice - salePrice) / regularPrice) * 100;
    return Math.round(discount);
  };

  if (isLoading) return <div className="onsale-loading"><h2>Loading Hot Deals...</h2></div>;

  return (
    <div className="onsale-page">
      <Navbar />
      <div className="onsale-container">
        
        <div className="onsale-header">
          <h2>Special Offers 🔥</h2>
          <p>Grab these exclusive deals before they're gone!</p>
        </div>
        
        <div className="onsale-grid">
          {saleProducts.length > 0 ? (
            saleProducts.map((product) => (
              <div className="onsale-card" key={product._id}>
                
                <div className="onsale-image-wrapper">
                  {/* 🔥 Dynamic Discount Badge */}
                  <span className="discount-badge">
                    {calculateDiscount(product.price, product.salePrice)}% OFF
                  </span>
                  
                  <img 
                    src={getDisplayImage(product.image)} 
                    alt={product.name} 
                    className="onsale-image"
                  />
                </div>

                <div className="onsale-info">
                  <h3 className="onsale-name">{product.name}</h3>
                  <p className="onsale-cat">{product.category}</p>
                  
                  <div className="onsale-pricing">
                    <p className="active-price">₹{product.salePrice.toLocaleString()}</p>
                    <p className="old-price">₹{product.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="onsale-button-group">
                    <button 
                      className="onsale-add-cart"
                      onClick={() => handleAddToCart(product._id)}
                    >
                      Add to Cart
                    </button>
                    
                    <button 
                      className="onsale-wishlist"
                      onClick={() => toggleWishlist(product._id)}
                    >
                      {wishlistItems.includes(product._id) ? (
                        <FaHeart className="heart-filled" />
                      ) : (
                        <FaRegHeart className="heart-outline" />
                      )}
                    </button>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="no-sale-products">
              <h3>No active sales right now.</h3>
              <p>Check back later for new discounts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnSaleProducts;