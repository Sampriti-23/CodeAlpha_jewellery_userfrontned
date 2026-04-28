import React, { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import Login from "../../pages/login/Login";
import RegisterModal from "../../pages/registration/Registration";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);

  const [showBrands, setShowBrands] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const sidebarRef = useRef();
  const userRef = useRef();

  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));

  const brands = ["Tanishq", "Malabar", "Kalyan", "CaratLane", "Titan"];

  /* CLOSE SIDEBAR */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* CLOSE USER DROPDOWN */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
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

            {/* BRANDS DROPDOWN */}
            <li
              className="brands"
              onMouseEnter={() => setShowBrands(true)}
              onMouseLeave={() => setShowBrands(false)}
            >
              Brands

              {showBrands && (
                <div className="dropdown">
                  {brands.map((brand, index) => (
                    <p key={index}>{brand}</p>
                  ))}
                </div>
              )}
            </li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="right">
          {!token ? (
            <>
              <button className="login" onClick={() => setOpenLoginModal(true)}>
                Login
              </button>
              <button className="register" onClick={() => setOpenRegisterModal(true)}>
                Register
              </button>
            </>
          ) : (
            <div className="user-menu" ref={userRef}>
              
              {/* USER ICON */}
              <div
                className="user-icon"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              {/* DROPDOWN */}
              {showUserMenu && (
                <div className="user-dropdown">
                  <p><Link to="/cart">My Cart</Link></p>
                  <p><Link to="/wishlist">My Wishlist</Link></p>
                  <p><Link to="/profile">My Profile</Link></p>
                  <p onClick={handleLogout} className="logout">Logout</p>
                </div>
              )}
            </div>
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

      {/* LOGIN MODAL */}
      {openLoginModal && (
        <Login
          closeModal={() => setOpenLoginModal(false)}
          openRegisterModal={() => {
            setOpenLoginModal(false);
            setOpenRegisterModal(true);
          }}
        />
      )}

      {/* REGISTER MODAL */}
      {openRegisterModal && (
        <RegisterModal
          closeModal={() => setOpenRegisterModal(false)}
          openLoginModal={() => {
            setOpenRegisterModal(false);
            setOpenLoginModal(true);
          }}
        />
      )}
    </>
  );
};

export default Navbar;