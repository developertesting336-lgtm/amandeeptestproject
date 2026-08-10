import { useRef } from "react";
import "./VideoSection.css";

import airpods from "../../assets/products/videos/airpods.mp4";
import phone from "../../assets/products/videos/phone.mp4";

const VideoSection = () => {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  const playVideo1 = () => {
    video1Ref.current?.play();
  };

  const stopVideo1 = () => {
    if (video1Ref.current) {
      video1Ref.current.pause();
      video1Ref.current.currentTime = 0;
    }
  };

  const playVideo2 = () => {
    video2Ref.current?.play();
  };

  const stopVideo2 = () => {
    if (video2Ref.current) {
      video2Ref.current.pause();
      video2Ref.current.currentTime = 0;
    }
  };

  return (
    <section className="video-section">
      <div className="video-section-wrapper">
        
        {/* FIRST VIDEO ITEM: PHONE */}
        <div className="video-container">
          <div className="video-content">
            <span className="video-tag">NEW ARRIVAL</span>
            <h2>
              iPhone 19 Pro
              <br />
              Series
            </h2>
            <p>
              Experience revolutionary performance, ultra-retina display, all-day battery life, and pro-grade video capture in a sleek titanium design.
            </p>
            <a href="/products?search=iphone">
              <button>Shop Now</button>
            </a>
          </div>

          <div
            className="video-card"
            onMouseEnter={playVideo1}
            onMouseLeave={stopVideo1}
          >
            <video ref={video1Ref} muted loop playsInline>
              <source src={phone} type="video/mp4" />
            </video>
          </div>
        </div>

        {/* SECOND VIDEO ITEM: AIRPODS */}
        <div className="video-container reverse">
          <div
            className="video-card"
            onMouseEnter={playVideo2}
            onMouseLeave={stopVideo2}
          >
            <video ref={video2Ref} muted loop playsInline>
              <source src={airpods} type="video/mp4" />
            </video>
          </div>

          <div className="video-content">
            <span className="video-tag">NEW ARRIVAL</span>
            <h2>
              AirPods Max Pro
              <br />
              Edition
            </h2>
            <p>
              Enjoy immersive sound with Active Noise Cancellation, 40-hour battery life, crystal clear calling, and premium ergonomics designed for all-day comfort.
            </p>
            <a href="/products?search=airpods">
              <button>Shop Now</button>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default VideoSection;