import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Home from "./pages/Home/HomePage.tsx";
import Lobby from "./pages/lobby.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
        <Routes>
          <Route path='/' Component={Home} />
          <Route path='/Lobby/:roomCode' element={<Lobby  />} />
        </Routes>
      </BrowserRouter>
  </React.StrictMode>
);
