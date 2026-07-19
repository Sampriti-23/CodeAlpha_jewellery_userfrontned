import React, { useState, useEffect } from "react";
import { FaHeart, FaTrash, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
const baseurl="https://codealpha-jewellery-backend.onrender.com";
const GET_CART_URL = `${baseurl}/api/cart/getcartsbyid`;
const PLACE_ORDER_URL = `${baseurl}/api/orders/neworder`;
const UPDATE_CART_URL = `${baseurl}/api/cart/updatecarts`;
const REMOVE_CART_URL = `${baseurl}/api/cart/deletecarts`;

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [shippingData, setShippingData] = useState({
    address: "",
    city: "",
    postalCode: "",
    phone: ""
  });

  const navigate = useNavigate();
  const userString = sessionStorage.getItem("user") || localStorage.getItem("user");

  let user = null;
  if (userString && userString !== "undefined") {
    user = JSON.parse(userString);
  }

  const userId = user?._id || user?.id;
  const userName = user?.name || "Guest";

  const fetchCart = async () => {
    const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    
    let currentUserId = null;
    if (userString && userString !== "undefined") {
      const userObj = JSON.parse(userString);
      currentUserId = userObj._id || userObj.id;
    }

    if (!currentUserId || !token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${GET_CART_URL}/${currentUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });

      if (response.ok) {
        const data = await response.json();
        const cartData = data.data ? data.data : data;
        setCart(cartData);
      } else {
        console.error("Backend refused to send cart. Status:", response.status);
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCart();
      fetchRecommendations();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchRecommendations = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${baseurl}/api/recommendations/${userId}`);
      const data = await response.json();
      if (data.success) {
        setRecommendedProducts(data.recommendations || []);
      }
    } catch (error) {
      console.log("❌ RECOMMEND ERROR:", error);
    }
  };

  // 🔥 CRITICAL FIX: Calculate total using Sale Price if available!
  const calculateTotal = () => {
    if (!cart || !cart.cartItems) return 0;
    
    return cart.cartItems.reduce((total, item) => {
      if (item.product && item.product.price) {
        
        // Use salePrice if it exists, otherwise use regular price
        const activePrice = item.product.salePrice && item.product.salePrice > 0 
          ? item.product.salePrice 
          : item.product.price;

        const cleanPrice = Number(activePrice.toString().replace(/,/g, ''));
        const cleanQty = Number(item.qty);
        
        return total + (cleanPrice * cleanQty);
      }
      return total;
    }, 0);
  };

  const handleUpdateQuantity = async (productId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return; 

    const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    
    let currentUserId = null;
    if (userString && userString !== "undefined") {
      const userObj = JSON.parse(userString);
      currentUserId = userObj._id || userObj.id;
    }

    try {
      const response = await fetch(`${UPDATE_CART_URL}/${currentUserId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ userId: currentUserId, productId: productId, qty: newQty })
      });

      if (response.ok) {
        fetchCart(); 
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleShippingChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  const handleRemoveItem = async (productId) => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const response = await fetch(`${baseurl}/api/cart/deletecarts/${userId}/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) fetchCart();
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    
    let currentUserId = null;
    let userName = "Guest";

    if (userString && userString !== "undefined") {
      const userObj = JSON.parse(userString);
      currentUserId = userObj._id || userObj.id;
      userName = userObj.name || "User";
    }

    try {
      const response = await fetch(PLACE_ORDER_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          userId: currentUserId,
          clientName: userName,
          shippingAddress: shippingData,
        })
      });

      if (response.ok) {
        setShowCheckout(false);
        setShowSuccess(true);
        setCart(null); 
      } else {
        const errorData = await response.json();
        alert(`Order Failed: ${errorData.message || "Route not found. Check PLACE_ORDER_URL!"}`);
      }
    } catch (error) {
      alert("Network error. Check console for details.");
    }
  };

  const getDisplayImage = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/80";
    return imagePath.startsWith('http') ? imagePath : `${baseurl}${imagePath}`;
  };

  if (isLoading) return <div className="cart-page"><h2>Loading Cart...</h2></div>;

  const totalItems = cart?.cartItems?.length || 0;
  const subTotal = calculateTotal();
  const deliveryCost = subTotal > 0 ? 50 : 0; 
  const grandTotal = subTotal + deliveryCost;

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h2>Your cart</h2>
        <p>{totalItems} Products in Your cart</p>
      </div>

      {totalItems === 0 && !showSuccess ? (
        <div className="empty-cart">
          <h3>Your cart is empty</h3>
          <button onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      ) : (
        <div className="cart-container-flex">
          <div className="cart-items-section">
            {cart?.cartItems?.map((item) => {
              if (!item.product) return null;

              // 🔥 Determine the active price for this single item
              const activePrice = item.product.salePrice && item.product.salePrice > 0 
                ? item.product.salePrice 
                : item.product.price;

              return (
                <div className="cart-item-row" key={item.product._id}>
                  <div className="item-image-box">
                   <img src={getDisplayImage(item.product.image)} alt={item.product.name} />
                  </div>
                  
                  <div className="item-details">
                    <h4>{item.product.name}</h4>
                    <p className="item-cat">Category: {item.product.category}</p>
                    
                    {/* 🔥 UI for Sale Price */}
                    {item.product.salePrice && item.product.salePrice > 0 ? (
                      <p className="item-price-per">
                        <span style={{ color: "#d9534f", fontWeight: "bold" }}>₹{item.product.salePrice}</span> 
                        <span style={{ textDecoration: "line-through", color: "#888", fontSize: "12px", marginLeft: "6px" }}>₹{item.product.price}</span> / per item
                      </p>
                    ) : (
                      <p className="item-price-per">₹{item.product.price} / per item</p>
                    )}
                  </div>

                  <div className="item-actions-right">
                    {/* 🔥 Multiply activePrice by qty, NOT regular price */}
                    <h4 className="total-item-price">₹{activePrice * item.qty}</h4>
                    <div className="controls">
                      <div className="qty-selector" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                          onClick={() => handleUpdateQuantity(item.product._id, item.qty, -1)}
                          style={{ border: 'none', background: '#eee', padding: '4px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '16px' }}>-</button>
                        <span style={{ fontWeight: 'bold' }}>{item.qty}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.product._id, item.qty, 1)}
                          style={{ border: 'none', background: '#eee', padding: '4px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '16px' }}>+</button>
                      </div>
                      <button className="icon-btn delete-btn" onClick={() => handleRemoveItem(item.product._id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="recommend-section">
              <h2>Recommended For You</h2>
              <div className="recommend-grid">
                {recommendedProducts.map((item) => (
                  <div className="recommend-card" key={item._id}>
                   <img src={getDisplayImage(item.image)} alt={item.name} />
                    <h4>{item.name}</h4>
                    <p>{item.category}</p>
                    {/* Simplified recommendation price to keep code short */}
                    <h3>₹{item.salePrice && item.salePrice > 0 ? item.salePrice : item.price}</h3>
                    <button className="recommend-btn">Add To Cart</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cart-summary-section">
            <div className="promo-code">
              <input type="text" placeholder="Promocode" />
              <button>Apply</button>
            </div>
            
            <div className="summary-details">
              <div className="sum-row"><p>{totalItems} items:</p> <p>₹{subTotal}</p></div>
              <div className="sum-row"><p>Delivery cost:</p> <p>₹{deliveryCost}</p></div>
              <div className="sum-row total-row">
                <h3>Total:</h3>
                <h3>₹{grandTotal}</h3>
              </div>
            </div>

            <button className="place-order-btn" onClick={() => setShowCheckout(true)}>
              Place Order →
            </button>
            
            <div className="delivery-note">
              🚚 Cash on Delivery Available
            </div>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="modal-overlay">
          <div className="checkout-modal">
            <button className="close-modal" onClick={() => setShowCheckout(false)}><FaTimes /></button>
            <h2>Shipping Details</h2>
            <p>Please enter your delivery address.<br /></p>
            
            <form onSubmit={handleConfirmOrder}>
              <input type="text" name="address" placeholder="Full Address (House, Street)" required onChange={handleShippingChange} />
              <input type="text" name="city" placeholder="City" required onChange={handleShippingChange} />
              <input type="text" name="postalCode" placeholder="Postal Code / Pincode" required onChange={handleShippingChange} />
              <input type="text" name="phone" placeholder="Phone Number" required onChange={handleShippingChange} />
              
              <button type="submit" className="confirm-btn">Confirm Order (COD)</button>
            </form>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="modal-overlay">
          <div className="success-modal">
            <h2>🎉 Order Placed Successfully!</h2>
            <p>Your order has been confirmed and will be delivered soon.</p>
            <button onClick={() => { setShowSuccess(false); navigate('/myorders'); }}>
              View My Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;