import { useState } from "react";
import "../styles/AudioVideoControls.scss";

import camera from "../assets/svgs/camera.svg";
import micro from "../assets/svgs/micro.svg";

import ActivateSound from "../assets/audio/activate.mp3";
import DeactivateSound from "../assets/audio/deactivate.mp3";

export default function AudioVideoControls() {
  const [isMicroActive, setIsMicroActive] = useState<boolean>(true);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);

  const toggleMicro = (isMicroActive: boolean) => {
    if (isMicroActive) {
      setIsMicroActive(false);
      new Audio(DeactivateSound).play();
    } else {
      setIsMicroActive(true);
      new Audio(ActivateSound).play();
    }
  };

  const toggleCamera = (isCameraActive: boolean) => {
    if (isCameraActive) {
      setIsCameraActive(false);
      new Audio(DeactivateSound).play();
    } else {
      setIsCameraActive(true);
      new Audio(ActivateSound).play();
    }
  };
  return (
    <div className="controls">
      <button
        className="controls__micro"
        onClick={() => toggleMicro(isMicroActive)}
      >
        <img src={micro} />
        <div className={`controls__status ${!isMicroActive && "deactivate"}`} />
      </button>
      <div className="controls__vertical-line" />
      <button
        className="controls__camera"
        onClick={() => toggleCamera(isCameraActive)}
      >
        <img src={camera} />
        <div
          className={`controls__status ${!isCameraActive && "deactivate"}`}
        />
      </button>
    </div>
  );
}
