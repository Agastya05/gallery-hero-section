import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@react-three/drei';

const MIN_DURATION = 1400; // never flash by faster than this
const MAX_DURATION = 9000; // never hold the visitor hostage if a file stalls

/**
 * LoadingScreen
 * -------------
 * Elegant preloader. The hall now hangs real photography from the Zigguratss
 * catalogue, so this tracks three.js's actual texture loading via drei's
 * useProgress rather than running on a fixed timer — otherwise the reveal
 * would land on empty frames and the artwork would pop in afterwards.
 *
 * The bar shows whichever is further along: elapsed time against the minimum
 * duration, or real load progress. It dismisses once loading is genuinely
 * finished (and the minimum has elapsed), with a hard cap so a slow or failed
 * image can never trap anyone on this screen.
 */
export default function LoadingScreen({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [fill, setFill] = useState(0);
  const { progress, active } = useProgress();

  // Mirrored into a ref so the rAF loop below can read the latest values
  // without being torn down and restarted (which would reset its clock) on
  // every progress tick. `started` guards the fact that useProgress reports
  // active=false before the first request has gone out.
  const loadRef = useRef({ progress: 0, active: false, started: false });
  useEffect(() => {
    loadRef.current.progress = progress;
    loadRef.current.active = active;
    if (active) loadRef.current.started = true;
  }, [progress, active]);

  useEffect(() => {
    const start = performance.now();
    let raf;

    function tick(now) {
      const elapsed = now - start;
      const { progress: p, active: busy, started } = loadRef.current;
      setFill(Math.max(Math.min(elapsed / MIN_DURATION, 1) * 0.4, p / 100));

      const loaded = started ? !busy && p >= 100 : elapsed >= MIN_DURATION;
      if ((elapsed >= MIN_DURATION && loaded) || elapsed >= MAX_DURATION) {
        setFill(1);
        setTimeout(() => setVisible(false), 250);
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div className="loading-screen" exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <span className="loading-mark">ATELIER</span>
          <div className="loading-bar">
            <div className="loading-bar-fill" style={{ transform: `scaleX(${fill})` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
