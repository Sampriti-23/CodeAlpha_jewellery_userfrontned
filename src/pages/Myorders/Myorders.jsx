import React, { useState, useEffect } from "react";
import Navbar from "../../layout/navbar/Navbar";
import "./Myorders.css";

const baseurl = "https://codealpha-jewellery-backend.onrender.com";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tracks which order's 3-dot menu is currently open
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
      let userId = null;
      if (userString && userString !== "undefined") {
        userId = JSON.parse(userString)._id || JSON.parse(userString).id;
      }

      if (!userId) return setIsLoading(false);

      try {
        const response = await fetch(`${baseurl}/api/orders/getuserorders/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          console.error("Failed to fetch orders. Status:", response.status);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    try {
      // Endpoint updated to match backend route: /updateorders/:id
      const response = await fetch(`${baseurl}/api/orders/updateorders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Cancelled" }),
      });

      if (response.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: "Cancelled" } : order
          )
        );
        setOpenDropdownId(null); // Close the dropdown after cancelling
        alert("Order has been successfully cancelled.");
      } else {
        alert("Failed to cancel the order. Please try again.");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("An error occurred while cancelling the order.");
    }
  };

  const getStatusClass = (status) => {
    if (status === 'Delivered') return 'status-delivered';
    if (status === 'Cancelled') return 'status-cancelled';
    return 'status-pending'; 
  };

  // Toggle the 3-dot menu
  const toggleDropdown = (orderId) => {
    setOpenDropdownId(openDropdownId === orderId ? null : orderId);
  };

  return (
    <>
      <Navbar />
      {/* Added onClick to close dropdown if user clicks anywhere else on the page */}
      <div className="my-orders-page" onClick={() => setOpenDropdownId(null)}>
        <h2>My Orders</h2>
        <p>Track your recent purchases.</p>

        {isLoading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <div className="no-orders">You haven't placed any orders yet.</div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div 
                className="order-card" 
                key={order._id} 
                onClick={(e) => e.stopPropagation()} // Prevents clicks inside the card from closing the menu automatically
              >
                <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="order-header-info">
                    <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Status & 3-Dot Menu Container */}
                  <div className="order-status-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                    <div className={`order-status ${getStatusClass(order.status)}`}>
                      {order.status}
                    </div>

                    {/* Only show the 3 dots if the order is Pending or Confirmed */}
                    {['Pending', 'Confirmed'].includes(order.status) && (
                      <div className="menu-container">
                        <button 
                          onClick={() => toggleDropdown(order._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#555',
                            padding: '0 5px'
                          }}
                        >
                          &#8942;
                        </button>

                        {/* Dropdown Menu UI */}
                        {openDropdownId === order._id && (
                          <div 
                            className="dropdown-menu"
                            style={{
                              position: 'absolute',
                              top: '100%',
                              right: '0',
                              marginTop: '5px',
                              backgroundColor: '#fff',
                              border: '1px solid #ddd',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                              borderRadius: '4px',
                              zIndex: 10,
                              minWidth: '120px'
                            }}
                          >
                            <button 
                              onClick={() => handleCancelOrder(order._id)}
                              style={{
                                width: '100%',
                                padding: '10px 15px',
                                background: 'none',
                                border: 'none',
                                color: '#ff4d4f',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            >
                              Cancel Order
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-items">
                  {order.orderItems.map((item, index) => (
                    <div className="order-item-row" key={index}>
                      <div className="item-details">
                        <p className="item-name">{item.name}</p>
                        <p className="item-qty">Qty: {item.qty} | Price: ₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="shipping-info">
                    <strong>Shipped To:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}
                  </div>
                  
                  <div className="order-total" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span>Total: ₹{order.totalPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyOrders;