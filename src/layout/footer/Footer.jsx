// Footer.jsx
import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Left */}
        <div className="footer-left">
          <h2 className="logo">Trinkets</h2>
          <p>
            Aurelle creates timeless silver jewelry with a modern, minimalist
            touch, designed for everyday elegance and effortless style.
          </p>
        </div>

        {/* Middle */}
        <div className="footer-section">
          <h3>ABOUT US</h3>
          <ul>
            <li>About Us</li>
            <li>Our Products</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Catalog */}
        <div className="footer-section">
          <h3>CATALOG</h3>
          <ul>
            <li>Earring</li>
            <li>Pendent</li>
            <li>Rings</li>
            <li>Chain</li>
            <li>Bangles</li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-section">
          <h3>SUPPORT</h3>
          <ul>
            <li>Contact Us</li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 Trinkets | All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;