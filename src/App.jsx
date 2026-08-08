import { useRef, useState } from 'react';
import Experience from './components/Gallery/Experience';
import HeroOverlay from './components/UI/HeroOverlay';
import ScrollTrack from './components/UI/ScrollTrack';
import LoadingScreen from './components/UI/LoadingScreen';
import { useLenisScroll } from './hooks/useLenisScroll';

/**
 * App
 * ---
 * Composition root. Structure:
 *  - <canvas-stage>  fixed, full-viewport R3F canvas (the multi-room 3D gallery)
 *  - <hero-overlay>  fixed DOM UI layered on top (nav, copy, room index)
 *  - <ScrollTrack>   invisible tall DOM element that creates real scroll
 *                    height, measured by Lenis to drive camera progress
 */
export default function App() {
  const scrollTrackRef = useRef(null);
  const [ready, setReady] = useState(false);

  useLenisScroll(scrollTrackRef);

  return (
    <>
      <LoadingScreen onComplete={() => setReady(true)} />

      <div className="canvas-stage" aria-hidden style={{ visibility: ready ? 'visible' : 'hidden' }}>
        <Experience />
      </div>

      <HeroOverlay />

      <ScrollTrack ref={scrollTrackRef} />
    </>
  );
}
