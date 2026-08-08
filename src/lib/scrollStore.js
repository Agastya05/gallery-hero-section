import { create } from 'zustand';

/**
 * scrollStore
 * -----------
 * Single source of truth for scroll progress (0 → 1) across the whole
 * experience. Both the DOM overlay and the R3F canvas read from this store
 * instead of listening to native scroll events directly, keeping the
 * camera, room lighting cues, and UI perfectly in sync.
 */
export const useScrollStore = create((set) => ({
  progress: 0,
  velocity: 0,
  activeChapter: 0,
  setProgress: (progress, velocity = 0) => set({ progress, velocity }),
  setActiveChapter: (activeChapter) => set({ activeChapter }),
}));
