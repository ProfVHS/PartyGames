import React from "react";
import Explosion from "../components/Explosion";
import CardFrontPositive from "../components/Cards/CardFrontPositive";

export default function TestPage() {
  return (
    <div style={{ width: "500px", height: "500px" }}>
      <CardFrontPositive score={500}/>
    </div>
  );
}
