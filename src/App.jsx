import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Front.jsx";
import Front from "./pages/home/Front.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Front />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;