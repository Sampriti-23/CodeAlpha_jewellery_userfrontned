// Front.jsx
import React from "react";
import "./Front.css";
import heroImg from "../../assets/hero.png"; // add your image here
import Footer from "../../layout/footer/Footer";
import Navbar from "../../layout/navbar/Navbar";

const Front = () => {
  return (
    <section className="hero">
       <Navbar/>
      <section className="overlay">
      {/* Left Content */}
      <div className="hero-text">
        <h1>
          Jewellery that tells <br /> your story
        </h1>

        <p className="hero-link">
          Explore Featured Jewellery <span>→</span>
        </p>
      </div>

      {/* Right Image */}
      <div className="hero-image">
        <img src={heroImg} alt="Jewelry Model" />
      </div>
      </section>
      <Footer />
    </section>
  );
};

export default Front;