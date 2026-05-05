import React, { useState, useEffect } from "react";
import { FaHeart, FaTrash, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const GET_CART_URL = "http://localhost:8000/api/cart/getcartsbyid";
const PLACE_ORDER_URL = "http://localhost:8000/api/orders/neworder";
const UPDATE_CART_URL = "http://localhost:8000/api/cart/updatecarts";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Checkout Modal States
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shippingData, setShippingData] = useState({
    address: "",
    city: "",
    postalCode: "",
    phone: ""
  });

  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId") || JSON.parse(sessionStorage.getItem("user"))?._id;
  const userName = JSON.parse(sessionStorage.getItem("user"))?.name;

  useEffect(() => {
    fetchCart();
  }, [userId]);

 const fetchCart = async () => {
    // 1. Grab BOTH the user ID and the security token
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
      // 2. Fetch the cart WITH the Authorization Token! 🔥
      const response = await fetch(`${GET_CART_URL}/${currentUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Show the backend our ID card
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Cart Data received:", data); // 🛑 FOR DEBUGGING
        
        // Sometimes backends wrap the response in a "data" object. 
        // This safely checks for both formats!
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
const calculateTotal = () => {
    if (!cart || !cart.cartItems) return 0;
    
    return cart.cartItems.reduce((total, item) => {
      if (item.product && item.product.price) {
        // 🔥 FIX: Clean the price (removes commas) and force it to be a Number
        const cleanPrice = Number(item.product.price.toString().replace(/,/g, ''));
        const cleanQty = Number(item.qty);
        
        return total + (cleanPrice * cleanQty);
      }
      return total;
    }, 0);
  };

  // 🔥 NEW: Handle Increase / Decrease Quantity
  const handleUpdateQuantity = async (productId, currentQty, change) => {
    const newQty = currentQty + change;
    
    // Don't let the quantity go below 1 (Use the trash button for deleting!)
    if (newQty < 1) return; 

    const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    
    let currentUserId = null;
    if (userString && userString !== "undefined") {
      const userObj = JSON.parse(userString);
      currentUserId = userObj._id || userObj.id;
    }

    try {
      // Call your backend updatecart route!
      const response = await fetch(`${UPDATE_CART_URL}/${currentUserId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          userId: currentUserId, 
          productId: productId, 
          qty: newQty 
        })
      });

      if (response.ok) {
        fetchCart(); // Instantly reload the cart to update the Total ₹ Price!
      } else {
        console.error("Failed to update quantity");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleShippingChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  // Submit the Order to the Backend
  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    
    // 1. Grab User Data & Token securely
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
      // 2. Send request WITH the Authorization Token
      const response = await fetch(PLACE_ORDER_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 🔥 FIX: Your backend needs to see this!
        },
        body: JSON.stringify({
          userId: currentUserId,
          clientName: userName,
          shippingAddress: shippingData,
          // NOTE: Depending on your backend, you might also need to send the cartItems or totalAmount here!
        })
      });

      if (response.ok) {
        setShowCheckout(false);
        setShowSuccess(true);
        setCart(null); // Clear cart visually
      } else {
        // 🔥 FIX: If the backend rejects the order, tell us EXACTLY why
        const errorData = await response.json();
        alert(`Order Failed: ${errorData.message || "Route not found. Check PLACE_ORDER_URL!"}`);
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("Network error. Check console for details.");
    }
  };

  if (isLoading) return <div className="cart-page"><h2>Loading Cart...</h2></div>;

  const totalItems = cart?.cartItems?.length || 0;
  const subTotal = calculateTotal();
  const deliveryCost = subTotal > 0 ? 50 : 0; // Flat ₹50 delivery fee (example)
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
          {/* LEFT: CART ITEMS */}
          <div className="cart-items-section">
            {cart?.cartItems?.map((item) => {
              if (!item.product) return null;
              return (
                <div className="cart-item-row" key={item.product._id}>
                  <div className="item-image-box">
                    <img src={item.product.image || "https://via.placeholder.com/80"} alt={item.product.name} />
                  </div>
                  
                  <div className="item-details">
                    <h4>{item.product.name}</h4>
                    <p className="item-cat">Category: {item.product.category}</p>
                    <p className="item-price-per">₹{item.product.price} / per item</p>
                  </div>

                  <div className="item-actions-right">
                    <h4 className="total-item-price">₹{item.product.price * item.qty}</h4>
                    <div className="controls">
                      <div className="qty-selector" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
  <button 
    onClick={() => handleUpdateQuantity(item.product._id, item.qty, -1)}
    style={{ border: 'none', background: '#eee', padding: '4px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '16px' }}
  >
    -
  </button>
  
  <span style={{ fontWeight: 'bold' }}>{item.qty}</span>
  
  <button 
    onClick={() => handleUpdateQuantity(item.product._id, item.qty, 1)}
    style={{ border: 'none', background: '#eee', padding: '4px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '16px' }}
  >
    +
  </button>
</div>
                      <button className="icon-btn heart-btn"><FaHeart /></button>
                      <button className="icon-btn delete-btn"><FaTrash /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: SUMMARY */}
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

      {/* 🟢 CHECKOUT MODAL */}
      {showCheckout && (
        <div className="modal-overlay">
          <div className="checkout-modal">
            <button className="close-modal" onClick={() => setShowCheckout(false)}><FaTimes /></button>
            <h2>Shipping Details</h2>
            <p>Please enter your delivery address.</p>
            
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

      {/* 🟢 SUCCESS POPUP */}
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