import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import HomePage from "./pages/HomePage.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LobbyPage from "./pages/LobbyPage.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
