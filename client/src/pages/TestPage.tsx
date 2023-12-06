import React from "react";
import Explosion from "../components/Explosion";
import CardFrontPositive from "../components/Cards/CardFrontPositive";
import Card from "../components/Cards/Card";

export default function TestPage() {
  return (
    <div style={{ width: "500px", height: "500px" }}>
      <Card 
      id={0}
      isPositive={true} 
      flip={false} 
      score={1} 
      onSelect={() => {}} 
      selected={false} 
      endGame={true} />
    </div>
  );
}
