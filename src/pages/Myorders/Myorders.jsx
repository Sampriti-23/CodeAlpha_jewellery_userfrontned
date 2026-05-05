import React, { useState, useEffect } from "react";
import Navbar from "../../layout/navbar/Navbar";
import "./Myorders.css";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
      let userId = null;
      if (userString && userString !== "undefined") {
        userId = JSON.parse(userString)._id || JSON.parse(userString).id;
      }

      if (!userId) return setIsLoading(false);

      // 🛑 ADD THESE TWO LINES FOR DEBUGGING:
      console.log("🕵️‍♂️ FRONTEND IS ASKING FOR USER ID:", userId);
      console.log("🌍 EXACT URL:", `http://localhost:8000/api/orders/getuserorders/${userId}`);

      try {
        const response = await fetch(`http://localhost:8000/api/orders/getuserorders/${userId}`);
        if (response.ok) {
          const data = await response.json();
          
          // 🛑 AND ADD THIS LINE TO SEE THE BACKEND'S RESPONSE:
          console.log("📦 BACKEND SENT BACK:", data);

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

  const getStatusClass = (status) => {
    if (status === 'Delivered') return 'status-delivered';
    if (status === 'Cancelled') return 'status-cancelled';
    return 'status-pending'; // For Pending, Processing, Confirmed, Shipped
  };

  return (
    <>
      <Navbar />
      <div className="my-orders-page">
        <h2>My Orders</h2>
        <p>Track your recent purchases.</p>

        {isLoading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <div className="no-orders">You haven't placed any orders yet.</div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card" key={order._id}>
                <div className="order-header">
                  <div>
                    <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={`order-status ${getStatusClass(order.status)}`}>
                    {order.status}
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
                  <div className="order-total">
                    Total: ₹{order.totalPrice}
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