import { AnimatePresence, motion } from 'framer-motion';
import { useScrollStore } from '../../lib/scrollStore';
import { ROOMS } from '../../lib/roomsConfig';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.35 + i * 0.12, duration: 1.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const NAV_LINKS = ['Collections', 'Artists', 'Journal'];

/**
 * HeroOverlay
 * -----------
 * DOM layer above the WebGL canvas, composed as three quiet bands so the
 * 3D gallery — not the interface — is the subject:
 *
 *   top     slim masthead: wordmark, three links, one action
 *   centre  a single stacked title lockup (meta line → title → credits)
 *   bottom  one live room read-out + the scroll cue, over a hairline
 *           progress rail
 *
 * The old six-item chapter index has been replaced by the bottom read-out:
 * it still surfaces every room's name and subtitle, but only the one you
 * are actually standing in, so nothing competes with the artwork. Which
 * room that is comes from CameraRig via the scroll store.
 */
export default function HeroOverlay() {
  const progress = useScrollStore((s) => s.progress);
  // Published by CameraRig from the camera's actual depth in the hall, so the
  // read-out never names a room you aren't standing in.
  const activeChapter = useScrollStore((s) => s.activeChapter);

  const room = ROOMS[activeChapter] ?? ROOMS[0];
  const introOpacity = Math.max(0, 1 - progress / 0.055);

  return (
    <div className="hero-overlay">
      <div className="overlay-veil" aria-hidden />

      <header className="top-bar">
        <motion.span className="brand-mark" initial="hidden" animate="visible" variants={fadeUp}>
          Atelier
        </motion.span>

        <motion.nav className="nav-links" initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          {NAV_LINKS.map((link) => (
            <button key={link} type="button" className="nav-link">
              {link}
            </button>
          ))}
          <button type="button" className="nav-action">
            Private Viewing
          </button>
        </motion.nav>
      </header>

      <div className="hero-center" style={{ opacity: introOpacity }}>
        <div className="hero-lockup">
          <motion.div className="hero-meta" initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <span>Exhibition</span>
            <span className="meta-pill">Vol. VI</span>
            <span>
              Six rooms <span className="meta-dim">of one collection</span>
            </span>
          </motion.div>

          <motion.h1 className="hero-title" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            A Gallery <em>Without Walls</em>
          </motion.h1>

          <motion.div className="hero-credits" initial="hidden" animate="visible" variants={fadeUp} custom={4}>
            <span className="credit">
              <span className="credit-dot" />
              Atelier, Paris
            </span>
            <span className="credit">
              <span className="credit-dot" />
              Curated by M. Lavelle
            </span>
          </motion.div>
        </div>
      </div>

      <footer className="bottom-bar">
        <motion.div className="room-status" initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <span className="room-count">
            {String(activeChapter + 1).padStart(2, '0')}
            <span className="room-count-total">/{String(ROOMS.length).padStart(2, '0')}</span>
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={room.id}
              className="room-label"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {room.name}
              <em>{room.subtitle}</em>
            </motion.span>
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="scroll-cue"
          initial={{ opacity: 0 }}
          animate={{ opacity: progress < 0.025 ? 1 : 0 }}
          transition={{ duration: 0.45, delay: progress < 0.025 ? 0.85 : 0 }}
        >
          <span>Scroll to enter</span>
          <div className="line" />
        </motion.div>
      </footer>

      <div className="progress-rail" aria-hidden>
        <div className="progress-rail-fill" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
}
