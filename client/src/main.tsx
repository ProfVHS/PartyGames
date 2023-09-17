import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import HomePage from "./pages/HomePage.tsx";
import RoomPage from "./pages/RoomPage.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Lobby/:roomCode" element={<RoomPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
