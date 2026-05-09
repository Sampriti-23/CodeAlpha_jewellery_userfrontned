import React, { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import Login from "../../pages/login/Login";
import RegisterModal from "../../pages/registration/Registration";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);

 
  const [showCollection, setShowCollection] = useState(false); // Added for Collection
  const [showUserMenu, setShowUserMenu] = useState(false);

  const sidebarRef = useRef();
  const userRef = useRef();
  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));


  const categories = ["Ring", "Necklace", "Earrings", "Bracelet", "Pendant"];

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
    setSidebarOpen(false);
    navigate('/'); 
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
            <li><Link to="/on-sale">On Sale</Link></li>

            {/* COLLECTION DROPDOWN (Using your exact dropdown structure) */}
            <li
              className="brands" 
              onMouseEnter={() => setShowCollection(true)}
              onMouseLeave={() => setShowCollection(false)}
            >
              Collection
              {showCollection && (
                <div className="dropdown">
                  {categories.map((cat, index) => (
                    <Link key={index} to={`/category/${cat}`}>
                      <p>{cat}</p>
                    </Link>
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
            <div className="user-actions">

              {/* CART ICON */}
              <Link to="/cart" className="cart-icon">🛒</Link>

              {/* USER MENU */}
              <div className="user-menu" ref={userRef}>
                <div
                  className="user-icon"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>

            </div>
          )}
        </div>

      </nav>
            <div className="sidebar">
          {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`} ref={sidebarRef}>
        <div className="close" onClick={() => setSidebarOpen(false)}>✕</div>
        <ul>
          <li className="profile"><Link to="/myorders" onClick={() => setSidebarOpen(false)}>Your Orders</Link></li>
          <li  className="profile"><Link to="/wishlist" onClick={() => setSidebarOpen(false)}>Your Wishlist</Link></li>
          <li className="profile"><Link to="/profile" onClick={() => setSidebarOpen(false)}>Your Profile</Link></li>
          <li onClick={handleLogout} className="logout">Logout</li>
        </ul>
      </div>
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