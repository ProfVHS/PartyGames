import React from "react";
import "../../styles/Home.scss";
import "../../styles/Test.scss";

import Logo from "../../assets/svgs/logo.svg";

export default function HomePage() {
  return (
    <div className="box">
      <img src={Logo} />
      <span className="name">Party Games</span>
      <div className="formWrapper">
        <input
          className="input"
          placeholder="Username"
          style={{ marginBottom: "60px", marginTop: "40px" }}
        />
        <button className="button" style={{ width: "48%" }}>
          Join
        </button>
        <input
          className="input"
          placeholder="Room Code"
          style={{ width: "48%" }}
        />
        <button className="button" style={{ marginTop: "40px" }}>
          Create Room
        </button>
      </div>
    </div>
  );
}
