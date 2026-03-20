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
    let progress = 0;
    let raf = null;
    let active = false;
    let savedScrollY = 0;
    let touchStartY = 0;
    let cooldown = false;  // prevents re-activation right after deactivate

    // ── Force video load on all devices ─────────────────────────────────────
    video.load();
    const onMeta = () => {
      duration = video.duration || 0;
      const p = video.play();
      if (p) p.then(() => { video.pause(); video.currentTime = 0; }).catch(() => {});
    };
    video.addEventListener('loadedmetadata', onMeta);
    if (video.readyState >= 1) onMeta();

    // ── Activate / Deactivate ────────────────────────────────────────────────
    const activate = (fromBelow = false) => {
      if (active || cooldown) return;
      savedScrollY = section.offsetTop;
      window.scrollTo(0, savedScrollY);
      document.body.style.overflow = 'hidden';
      active = true;
      // Set progress to correct end based on entry direction
      if (fromBelow) {
        progress = 1; // entering from below = reverse play from end
      } else {
        progress = 0; // entering from above = forward play from start
      }
    };

    const deactivate = (dir = 0) => {
      if (!active) return;
      document.body.style.overflow = '';
      active = false;
      cooldown = true;
      setTimeout(() => { cooldown = false; }, 800);

      if (dir > 0) {
        // Finished going down — jump scroll to just past the section bottom
        window.scrollTo(0, section.offsetTop + section.offsetHeight + 1);
      } else if (dir < 0) {
        // Finished going up — jump scroll to just before the section top
        window.scrollTo(0, section.offsetTop - 1);
      }
    };

    // ── RAF — only drives video + UI, no scroll pinning ─────────────────────
    const tick = () => {
      raf = requestAnimationFrame(tick);

      // Keep page pinned while active
      if (active) window.scrollTo(0, savedScrollY);

      if (!duration) return;

      const t = progress * duration;
      video.currentTime = t;

      if (progressRef.current)
        progressRef.current.style.width = `${progress * 100}%`;

      if (textRef.current) {
        const v = Math.min(1, Math.max(0, (progress - 0.3) / 0.3));
        textRef.current.style.opacity = v;
        textRef.current.style.transform = `translateY(${(1 - v) * 20}px)`;
      }
      if (subTextRef.current) {
        const v = Math.min(1, Math.max(0, (progress - 0.15) / 0.3));
        subTextRef.current.style.opacity = v;
        subTextRef.current.style.transform = `translateY(${(1 - v) * 16}px)`;
      }
    };
    raf = requestAnimationFrame(tick);

    // ── Section is "reachable" — viewport is anywhere over the section ───────
    const sectionInRange = () => {
      const rect = section.getBoundingClientRect();
      // section top is above or at viewport bottom, section bottom is below viewport top
      return rect.top < window.innerHeight && rect.bottom > 0;
    };

    // ── Wheel ────────────────────────────────────────────────────────────────
    const onWheel = (e) => {
      if (!active) {
        if (!sectionInRange()) return;
        const rect = section.getBoundingClientRect();
        const goingDown = e.deltaY > 0 && rect.top > -10;
        const goingUp   = e.deltaY < 0 && rect.bottom < window.innerHeight + 10;
        if (!goingDown && !goingUp) return;
        activate(goingUp); // fromBelow = true when scrolling up into section
      }

      e.preventDefault();

      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 40;
      if (e.deltaMode === 2) delta *= 800;

      progress = Math.min(1, Math.max(0, progress + delta / 600));

      if (progress >= 1) deactivate(+1);
      if (progress <= 0) deactivate(-1);
    };

    // ── Touch ────────────────────────────────────────────────────────────────
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      const dy = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;

      if (!active) {
        if (!sectionInRange()) return;
        const rect = section.getBoundingClientRect();
        const goingDown = dy > 0 && rect.top > -10;
        const goingUp   = dy < 0 && rect.bottom < window.innerHeight + 10;
        if (!goingDown && !goingUp) return;
        activate(goingUp);
      }

      e.preventDefault();

      progress = Math.min(1, Math.max(0, progress + dy / 400));

      if (progress >= 1) deactivate(+1);
      if (progress <= 0) deactivate(-1);
    };

    // ── Scroll listener — catches fast/momentum scroll that lands on section ─
    const onScroll = () => {
      if (active || cooldown) return;
      const rect = section.getBoundingClientRect();
      // Fast scroll landed with section covering viewport — detect direction from scroll position
      if (rect.top <= 0 && rect.bottom > 0) {
        // If we're past section top, we came from above (scrolling down)
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
