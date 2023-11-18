import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import HomePage from "./pages/HomePage.tsx";
import RoomPage from "./pages/RoomPage.tsx";

import { io } from "socket.io-client";
import TestPage from "./pages/TestPage.tsx";

const socket = io("http://localhost:3000");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage socket={socket} />} />
        <Route path="/Lobby/" element={<RoomPage socket={socket} />} />
        <Route path="/exp/" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
