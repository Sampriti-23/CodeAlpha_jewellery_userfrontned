import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Front from "./pages/home/Front.jsx";
import Login from "./pages/login/Login.jsx";
import RegisterModal from "./pages/registration/Registration.jsx";
import CategoryPage from "./pages/Category/Category.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Wishlist from "./pages/Wishlist/Wishlist.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Front />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterModal />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/cart" element={<Cart />} /> 
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;