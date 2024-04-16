import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import HomePage from "./pages/Home/HomePage.tsx";
import RoomPage from "./pages/Room/RoomPage.tsx";

import { io } from "socket.io-client";
import TestPage from "./pages/TestPage.tsx";
import EndgamePage from "./pages/EndGame/EndgamePage.tsx";
import { Error404 } from "./pages/404/404.tsx";

const socket = io("http://localhost:3000");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Lobby/" element={<RoomPage />} />
        <Route path="/endgame" element={<EndgamePage />} />
        <Route path="/test/" element={<TestPage />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
