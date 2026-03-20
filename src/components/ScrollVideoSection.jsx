import { useRef, useEffect } from 'react';
import './ScrollVideoSection.css';

const ScrollVideoSection = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const textRef = useRef(null);
  const subTextRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    let duration = 0;
    let raf = null;
    let targetTime = 0;
    let displayTime = 0;

    // Force video to load on all devices including iOS
    video.load();

    const onMetadata = () => {
      duration = video.duration || 0;
      // iOS unlock: play then immediately pause to allow currentTime scrubbing
      const p = video.play();
      if (p) p.then(() => { video.pause(); video.currentTime = 0; }).catch(() => {});
    };

    video.addEventListener('loadedmetadata', onMetadata);
    if (video.readyState >= 1) onMetadata();

    // Map scroll position to video progress (0..1)
    const getProgress = () => {
      const rect = container.getBoundingClientRect();
      const scrollable = container.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      // How far the container top has scrolled above viewport top
      const scrolled = -rect.top;
      return Math.min(1, Math.max(0, scrolled / scrollable));
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!duration) return;

      const p = getProgress();
      targetTime = p * duration;

      // Lerp displayTime toward targetTime for smooth scrubbing
      const diff = targetTime - displayTime;
      if (Math.abs(diff) > 0.001) {
        displayTime += diff * 0.2;
      } else {
        displayTime = targetTime;
      }

      video.currentTime = displayTime;

      if (progressRef.current)
        progressRef.current.style.width = `${p * 100}%`;

      if (textRef.current) {
        const t = Math.min(1, Math.max(0, (p - 0.3) / 0.3));
        textRef.current.style.opacity = t;
        textRef.current.style.transform = `translateY(${(1 - t) * 20}px)`;
      }
      if (subTextRef.current) {
        const t = Math.min(1, Math.max(0, (p - 0.15) / 0.3));
        subTextRef.current.style.opacity = t;
        subTextRef.current.style.transform = `translateY(${(1 - t) * 16}px)`;
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      video.removeEventListener('loadedmetadata', onMetadata);
    };
  }, []);

  return (
    // Tall container — height controls how much scroll = full video
    // 400vh = user scrolls 4 viewport heights to play full video
    <div ref={containerRef} className="svs-container">
      <div className="svs-sticky">
        <video
          ref={videoRef}
          className="svs-video"
          muted
          playsInline
          webkit-playsinline="true"
          preload="auto"
          src="/scroll-video.mp4"
        />
        <div className="svs-overlay" />
        <div className="svs-text-wrap">
          <p ref={subTextRef} className="svs-eyebrow">The Essence of Luxury</p>
          <h2 ref={textRef} className="svs-heading">
            Crafted for Those<br />Who Dare to Stand Out
          </h2>
        </div>
        <div className="svs-progress-track">
          <div ref={progressRef} className="svs-progress-bar" />
        </div>
        <div className="svs-scroll-hint">
          <span>scroll</span>
          <div className="svs-scroll-line" />
        </div>
      </div>
    </div>
  );
};

export default ScrollVideoSection;
