import { useRef, useEffect } from 'react';
import './ScrollVideoSection.css';

const ScrollVideoSection = () => {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const textRef = useRef(null);
  const subTextRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let locked = false;
    let targetTime = 0;
    let currentTime = 0;
    let raf = null;
    let touchStartY = 0;
    let duration = 0;
    let lockedScrollY = 0;

    // ── Lock / Unlock ────────────────────────────────────────────────────────
    const lock = () => {
      if (locked) return;
      lockedScrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      locked = true;
    };

    const unlock = (direction = 0) => {
      if (!locked) return;
      document.body.style.overflow = '';
      locked = false;
      // Nudge 1px in the travel direction so the browser continues scrolling
      window.scrollTo(0, lockedScrollY + direction * 1);
    };

    // ── Video metadata ───────────────────────────────────────────────────────
    const onMetadata = () => { duration = video.duration || 0; };
    video.addEventListener('loadedmetadata', onMetadata);
    if (video.readyState >= 1) onMetadata();

    // ── RAF loop ─────────────────────────────────────────────────────────────
    const tick = () => {
      raf = requestAnimationFrame(tick);

      // Pin scroll while locked
      if (locked) window.scrollTo(0, lockedScrollY);

      if (!duration) return;

      const diff = targetTime - currentTime;
      if (Math.abs(diff) > 0.001) {
        currentTime += diff * 0.15;
        video.currentTime = currentTime;
      } else if (currentTime !== targetTime) {
        currentTime = targetTime;
        video.currentTime = currentTime;
      }

      const p = currentTime / duration;

      if (progressRef.current)
        progressRef.current.style.width = `${p * 100}%`;

      if (textRef.current) {
        const t = Math.min(1, Math.max(0, (p - 0.3) / 0.3));
        textRef.current.style.opacity = t;
        textRef.current.style.transform = `translateY(${(1 - t) * 20}px)`;
      }
      if (subTextRef.current) {
        const t = Math.min(1, Math.max(0, (p - 0.2) / 0.3));
        subTextRef.current.style.opacity = t;
        subTextRef.current.style.transform = `translateY(${(1 - t) * 16}px)`;
      }

      if (locked) {
        if (targetTime >= duration && currentTime >= duration * 0.97) unlock(+1);
        if (targetTime <= 0   && currentTime <= duration * 0.03)  unlock(-1);
      }
    };
    raf = requestAnimationFrame(tick);

    // ── IntersectionObserver — fires as soon as section enters viewport ──────
    // threshold:0 = fires the instant even 1px is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !locked) {
            // Snap scroll to section top and lock immediately
            lockedScrollY = section.offsetTop;
            window.scrollTo(0, lockedScrollY);
            lock();
          }
        });
      },
      { threshold: 0 }
    );
    observer.observe(section);

    // ── Wheel ────────────────────────────────────────────────────────────────
    const onWheel = (e) => {
      if (!locked) return;
      e.preventDefault();

      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 40;
      if (e.deltaMode === 2) delta *= 800;
      delta = Math.max(-150, Math.min(150, delta));

      if (!duration) return;
      targetTime = Math.min(duration, Math.max(0, targetTime + (delta / 100) * 0.4));
    };

    // ── Touch ────────────────────────────────────────────────────────────────
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (!locked) return;
      e.preventDefault();

      const dy = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;

      if (!duration) return;
      targetTime = Math.min(duration, Math.max(0, targetTime + (dy / 150) * 0.4));
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      unlock();
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
      video.removeEventListener('loadedmetadata', onMetadata);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <div ref={sectionRef} className="svs-container">
      <div className="svs-sticky">
        <video
          ref={videoRef}
          className="svs-video"
          muted
          playsInline
          preload="auto"
        >
          <source src="/scroll-video.mp4" type="video/mp4" />
        </video>

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
