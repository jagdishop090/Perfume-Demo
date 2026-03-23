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

    let duration = 0;
    let targetProgress = 0;
    let renderedTime = -1;
    let raf = null;
    let active = false;
    let savedScrollY = 0;
    let touchStartY = 0;
    let lastTouchY = 0;
    let cooldown = false;
    let lastSeekTime = 0;

    // ── Video load ────────────────────────────────────────────────────────────
    video.load();
    const onMeta = () => {
      duration = video.duration || 0;
      // iOS unlock trick — play then immediately pause to allow seeking
      const p = video.play();
      if (p) p.then(() => { video.pause(); video.currentTime = 0; }).catch(() => {});
    };
    video.addEventListener('loadedmetadata', onMeta);
    if (video.readyState >= 1) onMeta();

    // ── Activate ──────────────────────────────────────────────────────────────
    const activate = (fromBelow = false) => {
      if (active || cooldown) return;
      savedScrollY = section.offsetTop;
      window.scrollTo(0, savedScrollY);
      document.body.style.overflow = 'hidden';
      active = true;
      targetProgress = fromBelow ? 1 : 0;
    };

    // ── Deactivate ────────────────────────────────────────────────────────────
    const deactivate = (dir = 0) => {
      if (!active) return;
      document.body.style.overflow = '';
      active = false;
      cooldown = true;
      setTimeout(() => { cooldown = false; }, 600);
      if (dir > 0) {
        window.scrollTo(0, section.offsetTop + section.offsetHeight + 1);
      } else if (dir < 0) {
        window.scrollTo(0, section.offsetTop - 1);
      }
    };

    // ── RAF loop ──────────────────────────────────────────────────────────────
    const tick = (now) => {
      raf = requestAnimationFrame(tick);

      if (active) window.scrollTo(0, savedScrollY);
      if (!duration) return;

      const targetTime = targetProgress * duration;
      const timeDiff = Math.abs(targetTime - renderedTime);
      const msSinceLast = now - lastSeekTime;

      if (timeDiff > 0.033 && msSinceLast >= 32) {
        video.currentTime = targetTime;
        renderedTime = targetTime;
        lastSeekTime = now;
      }

      if (progressRef.current)
        progressRef.current.style.width = `${targetProgress * 100}%`;

      if (textRef.current) {
        const v = Math.min(1, Math.max(0, (targetProgress - 0.3) / 0.3));
        textRef.current.style.opacity = v;
        textRef.current.style.transform = `translateY(${(1 - v) * 20}px)`;
      }
      if (subTextRef.current) {
        const v = Math.min(1, Math.max(0, (targetProgress - 0.15) / 0.3));
        subTextRef.current.style.opacity = v;
        subTextRef.current.style.transform = `translateY(${(1 - v) * 16}px)`;
      }
    };
    raf = requestAnimationFrame(tick);

    // ── IntersectionObserver — auto-activate on mobile when section fills viewport ──
    // This fires as soon as the section scrolls into full view, no tap needed.
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!isMobile()) return;
          if (cooldown || active) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.95) {
            // Section is almost fully visible — activate
            const r = section.getBoundingClientRect();
            const fromBelow = r.top < 0; // came from below
            activate(fromBelow);
          }
        });
      },
      { threshold: 0.95 }
    );
    observer.observe(section);

    // ── Wheel (desktop) ───────────────────────────────────────────────────────
    const tryActivateWheel = (delta) => {
      if (active || cooldown) return false;
      const r = section.getBoundingClientRect();
      const goingDown = delta > 0 && r.top >= -10 && r.top <= 10;
      const goingUp   = delta < 0 && r.bottom >= window.innerHeight - 10 && r.bottom <= window.innerHeight + 10;
      if (!goingDown && !goingUp) return false;
      activate(goingUp);
      return true;
    };

    const onWheel = (e) => {
      if (!active && !tryActivateWheel(e.deltaY)) return;
      e.preventDefault();

      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 40;
      if (e.deltaMode === 2) delta *= 800;
      delta = Math.max(-200, Math.min(200, delta));

      targetProgress = Math.min(1, Math.max(0, targetProgress + delta / 1200));

      if (targetProgress >= 1) deactivate(+1);
      else if (targetProgress <= 0) deactivate(-1);
    };

    // ── Touch (mobile) ────────────────────────────────────────────────────────
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      lastTouchY = touchStartY;
    };

    const onTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      // dy > 0 means finger moved up = scrolling down (forward)
      // dy < 0 means finger moved down = scrolling up (reverse)
      const dy = lastTouchY - currentY;
      lastTouchY = currentY;

      if (!active) {
        // On mobile, IntersectionObserver handles activation.
        // But if somehow not active yet and section is at top, activate here too.
        if (!cooldown) {
          const r = section.getBoundingClientRect();
          const atTop    = r.top >= -8 && r.top <= 8;
          const atBottom = r.bottom >= window.innerHeight - 8 && r.bottom <= window.innerHeight + 8;
          if ((dy > 0 && atTop) || (dy < 0 && atBottom)) {
            activate(dy < 0);
          }
        }
        return;
      }

      e.preventDefault();

      targetProgress = Math.min(1, Math.max(0, targetProgress + dy / 700));

      if (targetProgress >= 1) deactivate(+1);
      else if (targetProgress <= 0) deactivate(-1);
    };

    // ── Scroll fallback ───────────────────────────────────────────────────────
    const onScroll = () => {
      if (active || cooldown) return;
      const r = section.getBoundingClientRect();
      const tol = isMobile() ? 4 : 6;
      if (r.top <= tol && r.top >= -tol && r.bottom > 0) {
        activate(false);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      deactivate();
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      video.removeEventListener('loadedmetadata', onMeta);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('scroll', onScroll);
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
