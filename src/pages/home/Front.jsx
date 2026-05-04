import React from "react";
import "./Front.css";
import heroImg from "../../assets/hero.png";
import Footer from "../../layout/footer/Footer";
import Navbar from "../../layout/navbar/Navbar";
import { useNavigate } from "react-router-dom"; // 🔥 Added useNavigate

const Front = () => {
  const navigate = useNavigate(); // 🔥 Initialize hook

  const collections = [
    { name: "Ring", img: "https://images.unsplash.com/photo-1727784892009-f3cf06199b65" },
    { name: "Necklace", img: "https://images.unsplash.com/photo-1633934542430-0905ccb5f050" },
    { name: "Bracelet", img: "https://images.unsplash.com/photo-1721103428161-7d25616f670a" },
    { name: "Earrings", img: "https://images.unsplash.com/photo-1615854430736-c9fae5a95083" }, // 🔥 Fixed spelling to match ENUM
    { name: "Pendant", img: "https://images.unsplash.com/photo-1620656798579-1984d9e87df7" },
  ];

  // FAQ DATA
  const faqs = [
    {
      question: "WHAT MATERIAL IS THE RING MADE OF?",
      answer: "This ring is crafted from premium 925 sterling silver and designed for long-lasting wear. Each piece is finished to retain its shine while offering everyday comfort and durability.",
    },
    {
      question: "IS THE STONE NATURAL OR LAB-CREATED?",
      answer: "We use both natural and high-quality lab-created stones depending on the product.",
    },
    {
      question: "CAN THIS RING BE WORN DAILY?",
      answer: "Yes, it is designed for everyday wear with durability and comfort.",
    },
    {
      question: "DO YOU OFFER CUSTOMIZATION OR SPECIAL ORDERS?",
      answer: "Yes, we offer customization options for selected products.",
    },
    {
      question: "HOW CAN I PLACE AN ORDER ON THE WEBSITE?",
      answer: "Simply browse products, add to cart, and proceed to checkout.",
    },
  ];

  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <section className="hero">
      <Navbar />

      {/* HERO OVERLAY */}
      <section className="overlay">
        <div className="hero-text">
          <h1>
            Jewellery that tells <br /> your story
          </h1>

          <p className="hero-link" style={{cursor: "pointer"}} onClick={() => navigate('/on-sale')}>
            Explore Featured Jewellery <span>→</span>
          </p>
        </div>

        <div className="hero-image">
          <img src={heroImg} alt="Jewelry Model" />
        </div>
      </section>

      {/* ✅ OUR COLLECTION SECTION */}
      <section className="collection-section">
        <h2 className="collection-title">Our Collection</h2>

        <div className="collection-container">
          {collections.map((item, index) => (
            <div 
              className="collection-card" 
              key={index} 
              onClick={() => navigate(`/category/${item.name}`)} // 🔥 Routes to Category page dynamically
              style={{ cursor: "pointer" }}
            >
              <img src={item.img} alt={item.name} />
              <p>{item.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery */}
      <section className="features-section">
        <div className="feature">
          <div className="icon">🚚</div>
          <div>
            <h3>Express</h3>
            <p>Shipping</p>
          </div>
        </div>

        <div className="feature">
          <div className="icon">📦</div>
          <div>
            <h3>Easy Return</h3>
            <p>& Exchange</p>
          </div>
        </div>

        <div className="feature">
          <div className="icon">💳</div>
          <div>
            <h3>Cash on Delivery</h3>
            <p>Payment</p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="faq-section">
        <div className="faq-container">
          {/* LEFT */}
          <div className="faq-left">
            <h2>
              Frequently <br /> Asked <br /> Questions
            </h2>
          </div>

          {/* RIGHT */}
          <div className="faq-right">
            {faqs.map((item, index) => (
              <div
                key={index}
                className={`faq-item ${activeIndex === index ? "active" : ""}`}
              >
                <div
                  className="faq-question"
                  onClick={() =>
                    setActiveIndex(activeIndex === index ? null : index)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <span>{item.question}</span>
                  <span>{activeIndex === index ? "−" : "+"}</span>
                </div>

                {activeIndex === index && (
                  <div className="faq-answer">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </section>
  );
};

export default Front;