import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useScrollStore } from '../lib/scrollStore';

/**
 * useLenisScroll
 * ---------------
 * Initializes Lenis for buttery, inertia-based smooth scrolling and drives
 * a requestAnimationFrame loop that feeds normalized scroll progress into
 * the global store — the single scroll "engine" for the whole page.
 *
 * @param {React.RefObject<HTMLElement>} scrollTrackRef - element whose height
 *   defines the total scrollable distance of the cinematic sequence.
 */
export function useLenisScroll(scrollTrackRef) {
  const setProgress = useScrollStore((s) => s.setProgress);
  const rafId = useRef(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.1,
      infinite: false,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);

      const trackEl = scrollTrackRef.current;
      if (trackEl) {
        const maxScroll = trackEl.scrollHeight - window.innerHeight;
        const raw = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        const progress = Math.min(Math.max(raw, 0), 1);
        setProgress(progress, lenis.velocity ?? 0);
      }

      rafId.current = requestAnimationFrame(raf);
    }

    rafId.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId.current);
      lenis.destroy();
    };
  }, [scrollTrackRef, setProgress]);

  return lenisRef;
}
