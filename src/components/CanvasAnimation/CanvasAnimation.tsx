import type React from "react";
import { useEffect, useRef } from "react";
import CanvasManager, { type BackgroundSource } from "./CanvasManager.ts";

import image1 from "../../assets/backgrounds/image1.jpeg";
import image2 from "../../assets/backgrounds/image2.jpeg";
import image3 from "../../assets/backgrounds/image3.jpeg";
import image4 from "../../assets/backgrounds/image4.jpeg";
import video1 from "../../assets/backgrounds/video1.mp4";
import video2 from "../../assets/backgrounds/video2.mp4";
import video3 from "../../assets/backgrounds/video3.mp4";

const backgrounds: Array<BackgroundSource> = [
  { type: "img", src: image1 },
  { type: "video", src: video1 },
  { type: "img", src: image2 },
  { type: "video", src: video2 },
  { type: "img", src: image3 },
  { type: "video", src: video3 },
  { type: "img", src: image4 },
];

const CanvasAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvasManager = new CanvasManager(canvasRef.current, backgrounds);

      return () => {
        canvasManager.destroy();
      };
    }
  }, []);

  return (
    <canvas ref={canvasRef} id="base-canvas" width={1024} height={768} className="d-block m-auto border border-dark" />
  );
};

export default CanvasAnimation;
