import React from "react";
import "../styles/Ctb.scss";

import c4 from "../assets/svgs/C4.svg";

export default function Ctb() {
  return (
    <div className="ctb">
      <div className="ctb__c4">
        <img src={c4} />
        <span className="ctb__c4__counter">000</span>
      </div>
    </div>
  );
}
