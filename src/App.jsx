import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Front from "./pages/home/Front.jsx";
import Login from "./pages/login/Login.jsx";
import RegisterModal from "./pages/registration/Registration.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Front />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterModal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;