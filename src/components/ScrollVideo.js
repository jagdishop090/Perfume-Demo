import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollVideo.css';

const ScrollVideo = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const setup = () => {
      gsap.to(video, {
        currentTime: video.duration,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,  // higher = smoother/more delayed
        },
      });
    };

    if (video.readyState >= 1) {
      setup();
    } else {
      video.addEventListener('loadedmetadata', setup);
    }

    return () => {
      video.removeEventListener('loadedmetadata', setup);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="sv-container">
      <div className="sv-sticky">
        <video
          ref={videoRef}
          muted
          preload="auto"
          playsInline
          className="sv-video"
        >
          <source src="/scroll-video.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default ScrollVideo;
