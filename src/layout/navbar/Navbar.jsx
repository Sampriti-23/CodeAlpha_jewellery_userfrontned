import React, { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

const Navbar = ({ openLogin, openRegister }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));

  const sidebarRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <>
      <nav className="navbar">

        {/* LEFT */}
        <div className="left">

          {token && (
            <div className="hamburger" onClick={() => setSidebarOpen(true)}>
              ☰
            </div>
          )}

          <div className="logo">
            <span>Trinkets</span>
          </div>

          <ul className="links">
            <li><Link to="/">Home</Link></li>
            <li>On Sale</li>
            <li>Collection</li>
            <li>Brands</li>
          </ul>

        </div>

        {/* RIGHT */}
        <div className="right">
          {!token ? (
            <>
              <button className="login" onClick={openLogin}>
                Login
              </button>
              <button className="register" onClick={openRegister}>
                Register
              </button>
            </>
          ) : (
            <span className="user">Hi, {user?.name}</span>
          )}
        </div>

      </nav>

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`} ref={sidebarRef}>
        <div className="close" onClick={() => setSidebarOpen(false)}>✕</div>

        <ul>
          <li>Your Orders</li>
          <li>Your Wishlist</li>
          <li>Your Profile</li>
          <li onClick={handleLogout} className="logout">Logout</li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;